# Generated by Django 3.0.8 on 2020-08-22 14:00

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('debate', '0008_discussion_opening_argument'),
    ]

    operations = [
        migrations.AlterField(
            model_name='discussion',
            name='opening_argument',
            field=models.TextField(default=1),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='discussion',
            name='topic',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='discussions', to='debate.Topic'),
            preserve_default=False,
        ),
    ]
