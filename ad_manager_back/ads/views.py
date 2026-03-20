from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser

from datetime import datetime

from .models import Playlist, PlaylistMidia, FilaReproducao
from .serializers import (
    PlaylistSerializer,
    PlaylistMidiaSerializer,
    FilaReproducaoSerializer
)


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

            tipo = request.data.get(f"midias[{index}][tipo]")
            duracao = request.data.get(f"midias[{index}][duracao]")
            ordem = request.data.get(f"midias[{index}][ordem]")

            PlaylistMidia.objects.create(
                playlist=playlist,
                arquivo=arquivo,
                tipo=tipo,
                duracao=duracao if duracao else None,
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
            tipo = request.data.get(f"midias[{index}][tipo]")
            duracao = request.data.get(f"midias[{index}][duracao]")
            ordem = request.data.get(f"midias[{index}][ordem]")
            midia_id = request.data.get(f"midias[{index}][id]")

            if not tipo:
                break

            if midia_id:
                try:
                    midia = PlaylistMidia.objects.get(id=midia_id, playlist=instance)
                    midia.tipo = tipo
                    midia.duracao = duracao if duracao else None
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
                        arquivo=arquivo,
                        tipo=tipo,
                        duracao=duracao if duracao else None,
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


@api_view(["GET"])
@permission_classes([AllowAny])
def player_api(request):

    now = datetime.now()
    hora = now.replace(second=0, microsecond=0).time()
    dia = (now.weekday() + 1) % 7

    filas = FilaReproducao.objects.filter(ativo=True).order_by("horario_inicio")

    filas_validas = []

    for fila in filas:

        dias = fila.dias_semana or []

        dia_ok = dia in dias
        horario_ok = fila.horario_inicio <= hora <= fila.horario_fim

        if dia_ok and horario_ok:
            filas_validas.append(fila)

    if not filas_validas:
        return Response({"mensagem": "Nenhuma playlist ativa"})

    fila_ativa = sorted(
        filas_validas,
        key=lambda f: f.horario_inicio,
        reverse=True
    )[0]

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

    return Response({
        "fila": fila_ativa.nome,
        "total_midias": len(midias_final),
        "midias": midias_final
    })