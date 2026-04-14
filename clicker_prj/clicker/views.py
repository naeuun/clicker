from django.shortcuts import render, redirect
from .models import ClickUser
from django.http import JsonResponse
import json


def start(request):

    users = ClickUser.objects.all().order_by('-count')[:10]

    return render(request,'clicker/start.html',{
        'users':users
    })
    
def enter(request):

    name = request.POST.get('name')
    pin = request.POST.get('pin')

    user, created = ClickUser.objects.get_or_create(
        name=name,
        pin=pin
    )

    request.session['user_id'] = user.id

    return redirect('index')


def index(request):

    user_id = request.session.get('user_id')

    if not user_id:
        return redirect('start')

    user = ClickUser.objects.get(id=user_id)

    return render(request,'clicker/index.html',{
        'user':user
    })

def click(request):

    user_id = request.session.get('user_id')

    user = ClickUser.objects.get(id=user_id)

    user.count += 1
    user.save()

    return JsonResponse({
        'count':user.count
    })


def ranking(request):

    users = ClickUser.objects.all().order_by('-count')

    return render(request,'clicker/ranking.html',{
        'users':users
    })