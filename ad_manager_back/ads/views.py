from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone

from .models import Playlist, PlaylistMidia, FilaReproducao, Dispositivo
from .serializers import (
    PlaylistSerializer,
    PlaylistMidiaSerializer,
    FilaReproducaoSerializer,
    DispositivoSerializer,
)


class DispositivoViewSet(viewsets.ModelViewSet):
    queryset = Dispositivo.objects.all().order_by("nome")
    serializer_class = DispositivoSerializer
    permission_classes = [IsAuthenticated]


class PlaylistViewSet(viewsets.ModelViewSet):
    queryset = Playlist.objects.all().order_by("-id")
    serializer_class = PlaylistSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):

        nome = request.data.get("nome")
        playlist = Playlist.objects.create(nome=nome)

        index = 0

        while True:
            arquivo = request.FILES.get(f"midias[{index}][arquivo]")

            if not arquivo:
                break

            nome_midia = request.data.get(f"midias[{index}][nome]")
            tipo = request.data.get(f"midias[{index}][tipo]")
            duracao_raw = request.data.get(f"midias[{index}][duracao]")
            ordem = request.data.get(f"midias[{index}][ordem]")

            if tipo == "video":
                duracao = None
            else:
                duracao = int(float(duracao_raw)) if duracao_raw else None

            PlaylistMidia.objects.create(
                playlist=playlist,
                nome=nome_midia or "",
                arquivo=arquivo,
                tipo=tipo,
                duracao=duracao,
                ordem=ordem
            )

            index += 1

        return Response({"status": "criado"})

    def update(self, request, *args, **kwargs):

        instance = self.get_object()
        instance.nome = request.data.get("nome", instance.nome)
        instance.save()

        ids_enviados = request.data.getlist("midias_ids[]")

        if ids_enviados:
            PlaylistMidia.objects.filter(playlist=instance).exclude(id__in=ids_enviados).delete()
        else:
            PlaylistMidia.objects.filter(playlist=instance).delete()

        index = 0

        while True:

            arquivo = request.FILES.get(f"midias[{index}][arquivo]")
            nome_midia = request.data.get(f"midias[{index}][nome]")
            tipo = request.data.get(f"midias[{index}][tipo]")
            duracao_raw = request.data.get(f"midias[{index}][duracao]")
            ordem = request.data.get(f"midias[{index}][ordem]")
            midia_id = request.data.get(f"midias[{index}][id]")

            if not tipo:
                break

            if tipo == "video":
                duracao = None
            else:
                duracao = int(float(duracao_raw)) if duracao_raw else None

            if midia_id:
                try:
                    midia = PlaylistMidia.objects.get(id=midia_id, playlist=instance)
                    midia.nome = nome_midia or midia.nome
                    midia.tipo = tipo
                    midia.duracao = duracao
                    midia.ordem = ordem

                    if arquivo:
                        midia.arquivo = arquivo

                    midia.save()

                except PlaylistMidia.DoesNotExist:
                    pass

            else:
                if arquivo:
                    PlaylistMidia.objects.create(
                        playlist=instance,
                        nome=nome_midia or "",
                        arquivo=arquivo,
                        tipo=tipo,
                        duracao=duracao,
                        ordem=ordem
                    )

            index += 1

        return Response({"status": "atualizado"})


class PlaylistMidiaViewSet(viewsets.ModelViewSet):
    queryset = PlaylistMidia.objects.all().order_by("ordem")
    serializer_class = PlaylistMidiaSerializer
    permission_classes = [IsAuthenticated]


class FilaReproducaoViewSet(viewsets.ModelViewSet):
    queryset = FilaReproducao.objects.all().order_by("horario_inicio")
    serializer_class = FilaReproducaoSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        self.perform_create(serializer)

        return Response(serializer.data)

    def update(self, request, *args, **kwargs):

        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)

        self.perform_update(serializer)

        return Response(serializer.data)


def _resolver_fila_ativa(filas_qs):
    """Retorna a fila ativa no momento dado um queryset de FilaReproducao."""
    now = timezone.localtime()
    hora = now.replace(second=0, microsecond=0).time()
    dia = (now.weekday() + 1) % 7

    filas_validas = []

    for fila in filas_qs:
        dias = fila.dias_semana or []
        if dia in dias and fila.horario_inicio <= hora <= fila.horario_fim:
            filas_validas.append(fila)

    if not filas_validas:
        return None

    return sorted(filas_validas, key=lambda f: f.horario_inicio, reverse=True)[0]


def _montar_midias(fila_ativa):
    """Monta a lista flat de mídias de uma fila."""
    playlists = fila_ativa.playlists.select_related("playlist").order_by("ordem")

    midias_final = []

    for item in playlists:
        midias = item.playlist.midias.all().order_by("ordem")

        for m in midias:
            midias_final.append({
                "id": m.id,
                "nome": m.nome,
                "tipo": m.tipo,
                "arquivo": m.arquivo.url,
                "duracao": m.duracao,
                "playlist": item.playlist.nome
            })

    return midias_final


@api_view(["GET"])
@permission_classes([AllowAny])
def player_api_tv(request, codigo):
    """Endpoint por TV. Retorna a fila ativa para o dispositivo informado."""
    try:
        dispositivo = Dispositivo.objects.get(codigo=codigo.lower(), ativo=True)
    except Dispositivo.DoesNotExist:
        return Response({"mensagem": "TV não encontrada"}, status=404)

    filas_qs = FilaReproducao.objects.filter(ativo=True, dispositivo=dispositivo).order_by("horario_inicio")
    fila_ativa = _resolver_fila_ativa(filas_qs)

    if not fila_ativa:
        return Response({
            "mensagem": "Nenhuma playlist ativa",
            "orientacao": dispositivo.orientacao,
            "tipo_player": dispositivo.tipo_player,
        })

    midias_final = _montar_midias(fila_ativa)

    return Response({
        "fila": fila_ativa.nome,
        "orientacao": dispositivo.orientacao,
        "tipo_player": dispositivo.tipo_player,
        "total_midias": len(midias_final),
        "midias": midias_final
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def player_api(request):
    """Endpoint legado (global). Retorna filas sem dispositivo associado."""
    filas_qs = FilaReproducao.objects.filter(ativo=True, dispositivo__isnull=True).order_by("horario_inicio")
    fila_ativa = _resolver_fila_ativa(filas_qs)

    if not fila_ativa:
        return Response({"mensagem": "Nenhuma playlist ativa"})

    midias_final = _montar_midias(fila_ativa)

    return Response({
        "fila": fila_ativa.nome,
        "total_midias": len(midias_final),
        "midias": midias_final
    })
