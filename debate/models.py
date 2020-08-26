from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    pass

class Topic(models.Model):
    topic = models.CharField(max_length=100, blank=False)
    slug = models.SlugField(max_length=100, blank=False)
    def __str__(self):
        return f"{self.topic}"
    def Serialize(self):
        return {
            "id": self.id,
            "topic": self.topic,
            "slug": self.slug,
            "discussions": [{
                "id": discussion.id,
                "name": discussion.name,
                "user": discussion.user.username,
                "slug": discussion.slug,
                "opening_argument": discussion.opening_argument,
                "timestamp": discussion.timestamp.strftime("%b %d %Y, %I:%M %p"),
                "followers": [follower.username for follower in discussion.followers.all()]
            } for discussion in self.discussions.all().order_by("-timestamp")],
        }

class Discussion(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_discussions")
    name = models.CharField(max_length=260, null=True)
    slug = models.SlugField(max_length=260, unique=True)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="discussions")
    opening_argument = models.TextField(blank=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    followers = models.ManyToManyField(User, related_name="following_topics", through='Follower')

    def __str__(self):
        return f"{self.name}"

    def Serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "topic": self.topic.topic,
            "timestamp": self.timestamp,
            "opening_argument": self.opening_argument, 
            "followers": [follower.username for follower in self.followers.all()],
            "arguments": [argument.argument for argument in self.discussion_arguments.all().order_by("timestamp")],
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
        }

class Follower(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'discussion'], name='Follow_once'),
        ]




class Argument(models.Model):
    SIDE = (
        ('N', 'Neutral'),
        ('F', 'For'),
        ('A', 'Against')
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_arguments")
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name="discussion_arguments")
    argument = models.TextField(blank=False)
    side = models.CharField(max_length=1, choices=SIDE)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def Serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "discussion": self.discussion.name,
            "argument": self.argument,
            "side": self.side,
            "likers": [liker.user.username for liker in self.likers.all()],
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
        }


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="liked_arguments")
    argument = models.ForeignKey(Argument, on_delete=models.CASCADE, related_name="likers")
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'argument'], name='Like_once'),
        ]

