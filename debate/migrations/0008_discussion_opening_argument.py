# Generated by Django 3.0.8 on 2020-08-22 13:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('debate', '0007_auto_20200819_1748'),
    ]

    operations = [
        migrations.AddField(
            model_name='discussion',
            name='opening_argument',
            field=models.TextField(null=True),
        ),
    ]
