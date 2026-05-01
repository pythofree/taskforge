from django.urls import path

from . import views

auth_urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='auth-register'),
    path('login/', views.LoginView.as_view(), name='auth-login'),
    path('logout/', views.LogoutView.as_view(), name='auth-logout'),
    path('refresh/', views.RefreshView.as_view(), name='auth-refresh'),
    path('me/', views.MeView.as_view(), name='auth-me'),
]

key_urlpatterns = [
    path('', views.ApiKeyListCreateView.as_view(), name='key-list-create'),
    path('<uuid:pk>/', views.ApiKeyDestroyView.as_view(), name='key-destroy'),
]

urlpatterns = auth_urlpatterns
