import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ads', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Dispositivo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=200)),
                ('codigo', models.SlugField(max_length=20, unique=True, help_text='Código curto único. Ex: r, m, p, r2')),
                ('orientacao', models.CharField(choices=[('h', 'Horizontal'), ('v', 'Vertical')], default='h', max_length=1)),
                ('tipo_player', models.CharField(choices=[('react', 'Player React'), ('legacy', 'Player Legacy')], default='react', max_length=10)),
                ('ativo', models.BooleanField(default=True)),
                ('descricao', models.TextField(blank=True)),
                ('criado_em', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Dispositivo',
                'verbose_name_plural': 'Dispositivos',
                'ordering': ['nome'],
            },
        ),
        migrations.AddField(
            model_name='filareproducao',
            name='dispositivo',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='filas',
                to='ads.dispositivo',
            ),
        ),
    ]
