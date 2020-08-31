from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("discussion/<slug:slug>", views.discussion_view, name="discussion_view"),
    path("profile/<str:username>", views.profile, name="profile"),

    #API routes
    path("topic/<slug:slug>", views.topic, name="topic"),
    path("argument/<int:discussion>", views.argument, name="argument"),
    path("like/<int:argument>", views.like, name="like"),
    path("homepage", views.homepage, name="homepage"),
    path("user/<str:username>", views.user, name="user"),
    path("search", views.search, name="search"),
]