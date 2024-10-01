from django.urls import path
from user import views



urlpatterns = [


    path('signup/', views.Signup.as_view(), name='signup'),
    path('login/', views.Login.as_view(), name= 'login'),
    path('google-login',views.GoogleLogin.as_view(),name = "google-login"),
    path('user-details/',views.UserDetailsView.as_view(),name='user-details'),

]
