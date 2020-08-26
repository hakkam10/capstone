from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("discussion/<slug:slug>", views.discussion_view, name="discussion_view"),

    #API routes
    path("topic/<int:topic>", views.topic, name="topic"),
    path("argument/<int:discussion>", views.argument, name="argument"),
    path("like/<int:argument>", views.like, name="like"),
]