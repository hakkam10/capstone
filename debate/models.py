from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    pass

class Topic(models.Model):
    topic = models.TextField(blank=False)
    def __str__(self):
        return f"{self.topic}"

class Subtopic(models.Model):
    sub_topic = models.CharField(max_length=260, blank=False)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="sub_topics")
    timestamp = models.DateTimeField(auto_now_add=True)
    followers = models.ManyToManyField(User, related_name="following_topics", through='Followed_on')

    def __str__(self):
        return f"{self.sub_topic}"

class Followed_on(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    Subtopic = models.ForeignKey(Subtopic, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)


class Discussion(models.Model):
    SIDE = (
        ('N', 'Neutral'),
        ('F', 'For'),
        ('A', 'Against')
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_arguments")
    sub_topic = models.ForeignKey(Subtopic, on_delete=models.CASCADE, related_name="discussions")
    argument = models.TextField(blank=False)
    side = models.CharField(max_length=1, choices=SIDE)
    timestamp = models.DateTimeField(auto_now_add=True)


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="liked_posts")
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name="likers")
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'discussion'], name='Like_once'),
        ]

