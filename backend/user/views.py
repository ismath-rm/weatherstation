from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
import jwt
from datetime import timedelta
from django.utils.timezone import now
from superadmin.serializer import UserSerializer
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer



# Create your views here.



class MyRefreshTokenObtainPairSerializer(TokenRefreshSerializer):
	def __init__(self, *args, **kwargs):
		request = kwargs.pop('request', None)
		super().__init__(*args, **kwargs)

class MyRefreshTokenObtainPairView(TokenRefreshView):
	serializer_class = MyRefreshTokenObtainPairSerializer




class Signup(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        print('Signup endpoint hit')
        print('Request data:', request.data)
        try:
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')

            print(f"Received username: {username}, email: {email}, password: {'*' * len(password) if password else None}")

            # Validation
            if not email or not password:
                print("Validation failed: Email and password are required")
                return Response({'error': "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if the user already exists
            if User.objects.filter(username=username).exists():
                print(f"User with username '{username}' already exists")
                return Response({'error': "User with this username already exists"}, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=email).exists():
                print(f"User with email '{email}' already exists")
                return Response({'error': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create new user
            print('Creating new user...')
            user = User.objects.create(
                username=username,
                email=email,
                password=make_password(password)  # Hash the password before saving it
            )
            print(f"User '{username}' created successfully")
            
            # Return a success response
            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            print(f'An error occurred: {e}')
            return Response({'error': 'An error occurred while creating the user'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
class Login(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        try:
            # Extract data from the request
            username = request.data.get('username')
            password = request.data.get('password')

            # Basic validation
            if not username or not password:
                return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

            # Check if the user exists
            user = authenticate(username=username, password=password)
            print(f'debugging google login {user}uu')
            if user is None:
                return Response({"error": "Invalid username or password"}, status=status.HTTP_400_BAD_REQUEST)
            
            refresh = RefreshToken.for_user(user)
            print(refresh)

            # Successful authentication
            return Response({
                "username":user.username,
                "email":user.email,
                "id":user.id,
                "is_authenticated":user.is_active,
                "message": "Login successful",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "is_superuser": user.is_superuser  # Add this line
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # Log the exception
            print(f"An error occurred: {e}")

            # Return a generic error response
            return Response({"error": "An error occurred while logging in"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        

 
from datetime import datetime

class GoogleLogin(APIView):
    def post(self, request):
        try:
            print(f"Request data: {request.data}")
            token = request.data.get('token')
            print(f"Received token: {token}")

            if not token:
                return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
            # Log current server time
            print(f"Current server time: {datetime.now()}")

            # Log current server time
            print(f"Current server time: {datetime.now()}")

            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), settings.GOOGLE_CLIENT_ID, clock_skew_in_seconds=100)

            # Log token issued at and expiration times
            print(f"Token issued at (iat): {idinfo.get('iat')}")
            print(f"Token expiration (exp): {idinfo.get('exp')}")

            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                return Response({'error': 'Invalid token issuer'}, status=status.HTTP_400_BAD_REQUEST)

            email = idinfo.get('email')
            username = idinfo.get('sub')  # Unique identifier from Google

            # Check if the user already exists
            user = User.objects.filter(username=email, email=email).first()
            print(f"User found: {user}")
            if user:
                # User exists, check authentication status
                is_authenticated = user.is_active
                is_superuser = user.is_superuser
                user_name = user.username
                user_mail = user.email
                user_id = user.id

            else:
                # User does not exist, check for superuser status before creating
                existing_superuser = User.objects.filter(email=email, is_superuser=True).exists()
                if existing_superuser:
                    return Response("This email is in use for specific purpose", status=status.HTTP_400_BAD_REQUEST)
                else:
                    print("Creating new user...")
                    user = User.objects.create(username=email, email=email, is_superuser=False)
                    is_authenticated = user.is_active
                    is_superuser = False
                    user_name = email
                    user_mail = email
                    user_id = user.id

            # Return tokens only if the user is authenticated
            if is_authenticated:
                refresh = RefreshToken.for_user(user)
                print(f"User created__________________________________________________________________________________________________: {user}")

                return Response({
                    'username': user_name,
                    'email': user_mail,
                    'is_authenticated': is_authenticated,
                    'id': user_id,
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'is_superuser': is_superuser
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'User is not authenticated. Please contact support or check your account activation status.'
                }, status=status.HTTP_403_FORBIDDEN)

        except Exception as e:
            # Log the exception
            print(f"An error occurred: {e}")

            # Return a generic error response
            return Response({"error": "An error occurred while logging in {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class UserDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  
        print(user)

        # Get user details based on the authenticated user
        user_details = User.objects.get(username=user.username)
        
        # Serialize the user data
        serialized_data = UserSerializer(user_details)

        # Return the serialized user data
        return Response({'data': serialized_data.data}, status=status.HTTP_200_OK)