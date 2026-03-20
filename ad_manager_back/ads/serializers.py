from rest_framework import serializers
from .models import Playlist, PlaylistMidia, FilaReproducao, FilaPlaylist
from datetime import datetime
import json


class PlaylistMidiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaylistMidia
        fields = "__all__"


class PlaylistSerializer(serializers.ModelSerializer):
    midias = PlaylistMidiaSerializer(many=True, read_only=True)

    class Meta:
        model = Playlist
        fields = "__all__"

    def create(self, validated_data):
        request = self.context["request"]

        playlist = Playlist.objects.create(
            nome=validated_data.get("nome")
        )

        self._processar_midias(request, playlist)

        return playlist

    def update(self, instance, validated_data):
        request = self.context["request"]

        instance.nome = validated_data.get("nome", instance.nome)
        instance.save()

        instance.midias.all().delete()

        self._processar_midias(request, instance)

        return instance

    def _processar_midias(self, request, playlist):
        arquivos = request.FILES

        for key in arquivos.keys():
            if not key.startswith("midias["):
                continue

            index = key.split("[")[1].split("]")[0]

            arquivo = arquivos.get(key)

            tipo = request.data.get(f"midias[{index}][tipo]")
            duracao = request.data.get(f"midias[{index}][duracao]")
            ordem = request.data.get(f"midias[{index}][ordem]")

            PlaylistMidia.objects.create(
                playlist=playlist,
                arquivo=arquivo,
                tipo=tipo,
                duracao=duracao or None,
                ordem=ordem or 0
            )


class FilaPlaylistSerializer(serializers.ModelSerializer):
    playlist_nome = serializers.CharField(source="playlist.nome", read_only=True)

    class Meta:
        model = FilaPlaylist
        fields = "__all__"


class FilaReproducaoSerializer(serializers.ModelSerializer):
    playlists = FilaPlaylistSerializer(many=True, read_only=True)

    class Meta:
        model = FilaReproducao
        fields = "__all__"

    def _parse_time(self, value):
        try:
            return datetime.strptime(value, "%H:%M:%S").time()
        except:
            return datetime.strptime(value, "%H:%M").time()

    def validate(self, data):
        request = self.context["request"]

        dias_raw = request.data.get("dias_semana")
        dias = json.loads(dias_raw) if dias_raw else []

        inicio_raw = request.data.get("horario_inicio")
        fim_raw = request.data.get("horario_fim")

        inicio = self._parse_time(inicio_raw)
        fim = self._parse_time(fim_raw)

        instance = getattr(self, "instance", None)

        if not dias:
            raise serializers.ValidationError("Selecione ao menos um dia.")

        if inicio >= fim:
            raise serializers.ValidationError("Horário inválido.")

        conflitos = FilaReproducao.objects.filter(ativo=True)

        if instance:
            conflitos = conflitos.exclude(id=instance.id)

        for fila in conflitos:
            dias_existente = fila.dias_semana or []

            if not set(dias) & set(dias_existente):
                continue

            if (
                inicio < fila.horario_fim and
                fim > fila.horario_inicio
            ):
                raise serializers.ValidationError(
                    f"Conflito com '{fila.nome}'"
                )

        return data

    def create(self, validated_data):
        request = self.context["request"]

        dias = json.loads(request.data.get("dias_semana"))

        inicio = self._parse_time(request.data.get("horario_inicio"))
        fim = self._parse_time(request.data.get("horario_fim"))

        fila = FilaReproducao.objects.create(
            nome=request.data.get("nome"),
            horario_inicio=inicio,
            horario_fim=fim,
            dias_semana=dias
        )

        self._processar_playlists(request, fila)

        return fila

    def update(self, instance, validated_data):
        request = self.context["request"]

        dias = json.loads(request.data.get("dias_semana"))

        inicio = self._parse_time(request.data.get("horario_inicio"))
        fim = self._parse_time(request.data.get("horario_fim"))

        instance.nome = request.data.get("nome")
        instance.horario_inicio = inicio
        instance.horario_fim = fim
        instance.dias_semana = dias

        instance.save()

        instance.playlists.all().delete()

        self._processar_playlists(request, instance)

        return instance

    def _processar_playlists(self, request, fila):
        index = 0

        while True:
            playlist_id = request.data.get(f"playlists[{index}][playlist]")

            if not playlist_id:
                break

            ordem = request.data.get(f"playlists[{index}][ordem]")

            FilaPlaylist.objects.create(
                fila=fila,
                playlist_id=playlist_id,
                ordem=ordem or index + 1
            )

            index += 1