# Generated by Django 3.0.8 on 2020-08-19 11:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('debate', '0004_auto_20200818_1733'),
    ]

    operations = [
        migrations.AddField(
            model_name='discussion',
            name='slug',
            field=models.SlugField(max_length=260, null=True),
        ),
    ]
