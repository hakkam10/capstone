import datetime
import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
from django.http import JsonResponse
from django.core.paginator import Paginator
from django.views.generic import ListView
from django.utils.text import slugify
from .models import *

# Create your views here.

context = {
    'topics': Topic.objects.order_by('topic')
}

def index(request):
    return render(request, "debate/index.html", context)

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "debate/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "debate/login.html", context)


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        first_name = request.POST["firstname"]
        last_name = request.POST["lastname"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "debate/register.html", {
                "message": "Passwords must match."
            }, context)

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.first_name = first_name
            user.last_name = last_name
            user.save()
        except IntegrityError:
            return render(request, "debate/register.html", {
                "message": "Username already taken."
            }, context)
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "debate/register.html", context)

def discussion(request):
    return render(request, "debate/discussion.html", context)

@csrf_exempt
@login_required
def topic(request, slug):
    try:
        topic = Topic.objects.get(slug=slug)
    except Topic.DoesNotExist:
        return JsonResponse({"message": "Topic does not exist, try again"})

    if request.method == "GET":
        return JsonResponse(topic.Serialize(), safe=False)

    if request.method == "POST":
        data = json.loads(request.body)
        name = data.get("name")
        OA = data.get("argument")
        slug = slugify(name)

        discussion = Discussion(topic=topic, name=name, user=request.user)
        discussion.slug = slug
        discussion.opening_argument = OA
        try:
            discussion.full_clean()
            discussion.save()
            return JsonResponse({"message": "success"}, status=201)
        except ValidationError as e:
            error = [{f"{k}": [b]for b in v} for k, v in e]
            return JsonResponse(error, safe=False)

    
@csrf_exempt
@login_required
def argument(request, discussion):
    try:
        discussion = Discussion.objects.get(pk=discussion)
    except Discussion.DoesNotExist:
        return JsonResponse({"message": "Discussion does not exist"})

    if request.method == "GET":
        arguments = Argument.objects.filter(discussion=discussion).order_by("timestamp")
        return JsonResponse([argument.Serialize() for argument in arguments], safe=False)

    if request.method == "POST":
        data = json.loads(request.body)
        argument = data.get("argument")
        side = data.get("side")

        try:
            new_argument = Argument(user=request.user, discussion=discussion, argument=argument, side=side)
            new_argument.full_clean()
            new_argument.save()
            return JsonResponse({"message": "success"}, status=201)
        except ValidationError as e:
            error = [{f"{k}": [b]for b in v} for k, v in e]
            return JsonResponse(error, safe=False)

    if request.method == "PUT":
        try:
            obj, created = Follower.objects.get_or_create(user=request.user, discussion=discussion)
            if not created:
                obj.delete()
                return JsonResponse({"message": "deleted"})
            else:
                return JsonResponse({"message": "created"})
        except:
            return JsonResponse({"message": "failed"})


@csrf_exempt
@login_required
def discussion_view(request, slug):
    try:
        discussion = Discussion.objects.get(slug=slug)
        context["discussion"] = discussion
        participants = list(dict.fromkeys(User.objects.filter(user_arguments__discussion=discussion)))
        context["participants"] = participants
        context["found"] = True
        return render(request, "debate/discussion.html", context)

    except Discussion.DoesNotExist:
        context["found"] = False
        return render(request, "debate/discussion.html", context)

@csrf_exempt
@login_required
def like(request, argument):
    try:
        argument = Argument.objects.get(pk=argument)
    except Argument.DoesNotExist:
        return JsonResponse({"message": "Argument does not exist"})

    if request.method == "PUT":
        obj, created = Like.objects.get_or_create(user=request.user, argument=argument)
        if not created:
            obj.delete()
            return JsonResponse({"message": "deleted"})
        else:
            return JsonResponse({"message": "created"})

@csrf_exempt
@login_required
def homepage(request):
    user_discussions = Discussion.objects.filter(followers=request.user)
    uf = [user_discussion.Serialize() for user_discussion in user_discussions]

    follower_participated = list(dict.fromkeys(Discussion.objects.filter(discussion_arguments__user__followers=request.user)))
    f_p = [discussion.Serialize() for discussion in follower_participated]
    
    follower_started = Discussion.objects.filter(user__followers=request.user)
    f_s = [discussion.Serialize() for discussion in follower_started]
    

    new_discussions = Discussion.objects.all().order_by("-timestamp")[:3]
    nd = [new_discussion.Serialize() for new_discussion in new_discussions]

    context = [uf] + [f_s] + [f_p] + [nd]
    return JsonResponse(context, safe=False)



@csrf_exempt
@login_required
def user(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"message": "User does not exist"})
    if request.method == "PUT":
        try:
            if request.user in user.followers.all():
                user.followers.remove(request.user)
                return JsonResponse({"message": "deleted"})
            else:
                user.followers.add(request.user)
                return JsonResponse({"message": "created"})
        except:
                return JsonResponse({"message": "failed"})

    if request.method == "GET":
        discussions = Discussion.objects.filter(user=user)
        d = [discussion.Serialize() for discussion in discussions]
        participated_discussions = list(dict.fromkeys(Discussion.objects.filter(discussion_arguments__user=user).exclude(user=user))) 
        p_d = [discussion.Serialize() for discussion in participated_discussions]
        context = [d] + [p_d]
        return JsonResponse(context, safe=False)

@csrf_exempt
@login_required
def profile(request, username):
    try:
        user = User.objects.get(username=username)
        followers = User.objects.filter(followers__username=username)
        context["found"] = True
    except User.DoesNotExist:
        context["found"] = False

    context["user"] = user
    context["followers"] = followers

    return render(request, "debate/profile.html", context)

@csrf_exempt
@login_required
def search(request):
    query = str(request.GET.get("query"))
    discussions = Discussion.objects.filter(name__icontains=query)[:5]
    names = [discussion.SearchSerialize() for discussion in discussions]
    return JsonResponse(names, safe=False)
