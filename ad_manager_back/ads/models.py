from django.db import models
import mimetypes
import os
from django.core.exceptions import ValidationError


class Dispositivo(models.Model):

    ORIENTACAO_CHOICES = [
        ('h', 'Horizontal'),
        ('v', 'Vertical'),
    ]

    PLAYER_CHOICES = [
        ('react', 'Player Moderno'),
        ('legacy', 'Player Compatível'),
    ]

    nome = models.CharField(max_length=200)

    codigo = models.SlugField(
        max_length=20,
        unique=True,
        help_text="Código curto único. Ex: r, m, p, r2"
    )

    orientacao = models.CharField(
        max_length=1,
        choices=ORIENTACAO_CHOICES,
        default='h'
    )

    tipo_player = models.CharField(
        max_length=10,
        choices=PLAYER_CHOICES,
        default='react'
    )

    ativo = models.BooleanField(default=True)

    descricao = models.TextField(blank=True)

    criado_em = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.codigo = self.codigo.lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nome} ({self.codigo})"

    class Meta:
        verbose_name = "Dispositivo"
        verbose_name_plural = "Dispositivos"
        ordering = ["nome"]


class Playlist(models.Model):

    nome = models.CharField(max_length=200)

    ativo = models.BooleanField(default=True)

    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome


class PlaylistMidia(models.Model):

    playlist = models.ForeignKey(
        Playlist,
        on_delete=models.CASCADE,
        related_name="midias"
    )

    nome = models.CharField(max_length=200)

    arquivo = models.FileField(upload_to="playlists/")

    tipo = models.CharField(
        max_length=10,
        editable=False
    )

    ordem = models.PositiveIntegerField()

    duracao = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Tempo em segundos (somente imagem)"
    )

    criado_em = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):

        if self.arquivo:

            mime, _ = mimetypes.guess_type(self.arquivo.name)

            if mime and mime.startswith("video"):
                self.tipo = "video"

                if not self.duracao:
                    self.duracao = 0

            else:
                self.tipo = "imagem"

                if not self.duracao:
                    raise ValidationError("Imagem precisa de duração.")

        super().save(*args, **kwargs)

    def clean(self):
        if self.tipo == "imagem" and not self.duracao:
            raise ValidationError("Imagem precisa de duração.")
        if self.tipo == "video":
            self.duracao = None

    def delete(self, *args, **kwargs):
        if self.arquivo and os.path.isfile(self.arquivo.path):
            os.remove(self.arquivo.path)
        super().delete(*args, **kwargs)

    class Meta:
        ordering = ["ordem"]

    def __str__(self):
        return f"{self.playlist.nome} - {self.nome}"


class FilaPlaylist(models.Model):

    fila = models.ForeignKey(
        "FilaReproducao",
        related_name="playlists",
        on_delete=models.CASCADE
    )

    playlist = models.ForeignKey(
        Playlist,
        on_delete=models.CASCADE
    )

    ordem = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.fila.nome} - {self.playlist.nome}"


class FilaReproducao(models.Model):

    nome = models.CharField(max_length=200)

    dispositivo = models.ForeignKey(
        Dispositivo,
        on_delete=models.CASCADE,
        related_name='filas',
        null=True,
        blank=True
    )

    dias_semana = models.JSONField(
        null=True,
        blank=True,
        help_text="Ex: [0,1,2]"
    )

    horario_inicio = models.TimeField()
    horario_fim = models.TimeField()

    ativo = models.BooleanField(default=True)

    criado_em = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if not self.dias_semana:
            raise ValidationError("Selecione ao menos um dia.")

        if self.horario_inicio >= self.horario_fim:
            raise ValidationError("Horário inválido.")

        # Conflito verificado apenas dentro do mesmo dispositivo
        conflitos = FilaReproducao.objects.filter(
            ativo=True,
            dispositivo=self.dispositivo
        ).exclude(id=self.id)

        for fila in conflitos:
            conflito_dia = bool(
                set(self.dias_semana or []) &
                set(fila.dias_semana or [])
            )

            if conflito_dia:
                if (
                    self.horario_inicio < fila.horario_fim and
                    self.horario_fim > fila.horario_inicio
                ):
                    raise ValidationError(
                        f"Conflito com '{fila.nome}'"
                    )

    def __str__(self):
        return self.nome