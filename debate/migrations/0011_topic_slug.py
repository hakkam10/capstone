# Generated by Django 3.0.8 on 2020-08-26 15:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('debate', '0010_auto_20200824_1939'),
    ]

    operations = [
        migrations.AddField(
            model_name='topic',
            name='slug',
            field=models.SlugField(default=1, max_length=100),
            preserve_default=False,
        ),
    ]