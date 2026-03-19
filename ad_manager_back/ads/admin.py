from django import forms
from django.contrib import admin
from .models import Playlist, PlaylistMidia, FilaReproducao, FilaPlaylist


class FilaForm(forms.ModelForm):

    DIAS_CHOICES = (
        (0, "Dom"),
        (1, "Seg"),
        (2, "Ter"),
        (3, "Qua"),
        (4, "Qui"),
        (5, "Sex"),
        (6, "Sáb"),
    )

    dias_semana = forms.MultipleChoiceField(
        choices=DIAS_CHOICES,
        widget=forms.CheckboxSelectMultiple,
        required=False
    )

    class Meta:
        model = FilaReproducao
        fields = "__all__"

    def clean_dias_semana(self):
        data = self.cleaned_data.get("dias_semana")
        if not data:
            return []
        return [int(d) for d in data]

    def initial_from_instance(self):
        if self.instance and self.instance.dias_semana:
            self.initial["dias_semana"] = self.instance.dias_semana


class PlaylistMidiaInline(admin.TabularInline):
    model = PlaylistMidia
    extra = 1


@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ("nome", "ativo", "criado_em")
    inlines = [PlaylistMidiaInline]


class FilaPlaylistInline(admin.TabularInline):
    model = FilaPlaylist
    extra = 1


@admin.register(FilaReproducao)
class FilaReproducaoAdmin(admin.ModelAdmin):
    form = FilaForm

    list_display = (
        "nome",
        "horario_inicio",
        "horario_fim",
        "ativo"
    )

    inlines = [FilaPlaylistInline]


@admin.register(PlaylistMidia)
class PlaylistMidiaAdmin(admin.ModelAdmin):
    list_display = ("playlist", "nome", "tipo", "ordem", "duracao")