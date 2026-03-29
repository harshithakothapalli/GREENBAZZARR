from django.contrib import admin
from django.urls import path
from .import views

urlpatterns=[
    path('api/payment/',views.payment,name='payment'),
    path('view_payment/<str:user_id>/', views.view_payment, name='view_payment'),

]