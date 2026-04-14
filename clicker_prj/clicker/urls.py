from django.urls import path
from . import views

urlpatterns = [
    path('', views.start, name='start'),
    path('enter/', views.enter, name='enter'),
    path('clicker/', views.index, name='index'),
    path('click/', views.click, name='click'),
    path('ranking/', views.ranking, name='ranking'),
]