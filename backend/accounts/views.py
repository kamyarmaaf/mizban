from os import access
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.http.response import JsonResponse
from django.shortcuts import render, get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import VisitorUser, MizbanUser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework import permissions, authentication
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (VisitorUserSerializer, VisitorUserDetailSerializer,
                          VisitorsSerializer,MizbanUserSerializer,
                          MizbanUserListSerializer, MizbanUserDetailSerializer)



class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        data = request.data
        username = data.get('username')
        password = data.get('password')
        user = authenticate(request, username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            visitor = VisitorUser.objects.filter(username=user.username).first()
            mizban = MizbanUser.objects.filter(username=user.username).first()
            response_data = {}
            if visitor:
                serializer = VisitorUserSerializer(visitor)
                data = dict(serializer.data)
            elif mizban:
                serializer = MizbanUserSerializer(mizban)
                data = dict(serializer.data)
            elif user.is_superuser:
                data = {"username": user.username, "email": user.email, "role": "admin"}

            data["is_superuser"] = user.is_superuser
            data["is_staff"] = user.is_staff
            data["access"] = access_token
            data["refresh"] = refresh_token

            return Response(data, status=status.HTTP_200_OK)

        return Response({"error":"نام کاربری یا رمز عبور اشتباه است"},status=status.HTTP_401_UNAUTHORIZED)



class CreateMizbanUserView(APIView):
    def post(self, request, *args, **kwargs):
        print(request.data)
        data = request.data
        name = data.get('fullName')
        email = data.get('email')
        phone = data.get('phone')
        password = data.get('password')
        province = data.get('province')
        city = data.get('city')
        hosting_type = data.get('hostingType')
        if not all([name, phone, password, province, city, hosting_type]):
            return Response({"error": "تمام فیلد های ضروری پر نشده اند"}, status=status.HTTP_400_BAD_REQUEST)

        if MizbanUser.objects.filter(phone=phone).exists():
            return Response(
                {"error":"شماره تلفن قبلا وارد شده است"}, status=status.HTTP_400_BAD_REQUEST
            )
        if VisitorUser.objects.filter(phone=phone).exists():
            return Response(
                {"error":"شماره تلفن قبلا وارد شده است"}, status=status.HTTP_400_BAD_REQUEST
            )
        user = MizbanUser.objects.create(
            username=phone,
            email=email,
            phone=phone,
            name=name,
            province=province,
            city=city,
            password=make_password(password),
            hosting_type=hosting_type,
            user_type='mizban',
            status='pending'
        )
        user.save()
        serializer = MizbanUserSerializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MizbanUserListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        misbans = MizbanUser.objects.all()
        serializer = MizbanUserListSerializer(misbans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MizbanUserDetailView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, pk,  *args, **kwargs):
        mizban_user = get_object_or_404(MizbanUser, pk=pk)
        serializer = MizbanUserDetailSerializer(mizban_user)
        return Response(serializer.data, status=status.HTTP_200_OK)







class CreateVisitorUserView(APIView):
    def post(self, request, *args, **kwargs):
        name = request.data.get('fullName')
        password = request.data.get('password')
        email = request.data.get('email')
        phone = request.data.get('phone')
        if VisitorUser.objects.filter(phone=phone).exists():
            return Response(
                {"error":"شماره تلفن قبلا وارد شده است"}, status=status.HTTP_400_BAD_REQUEST
            )
        if MizbanUser.objects.filter(phone=phone).exists():
            return Response(
                {"error":"شماره تلفن قبلا وارد شده است"}, status=status.HTTP_400_BAD_REQUEST
            )
        user = VisitorUser.objects.create(username=phone ,name=name,
                                          email=email, phone=phone,
                                          password=make_password(password))
        user.save()

        serializer = VisitorUserSerializer(user)
        return Response(data=serializer.data, status=status.HTTP_201_CREATED)


class VisitorUserListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        serializer = VisitorsSerializer(VisitorUser.objects.all(), many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)

class VisitorUserDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request, pk, *args, **kwargs):
        visitor_user = get_object_or_404(VisitorUser, pk=pk)
        if visitor_user:
            serializer = VisitorUserDetailSerializer(visitor_user)
            return Response(data=serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)



class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if refresh_token is None:
                return Response({"error": "refresh_token is required"}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.is_superuser:
            return Response({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": "admin",  # فرانت‌اند این را چک می‌کند
                "is_superuser": True
            })

        try:
            visitor = VisitorUser.objects.get(id=user.id)
            avatar_url = request.build_absolute_uri(visitor.avatar.url) if visitor.avatar else None

            return Response({
                "id": visitor.id,
                "username": visitor.username,
                "email": visitor.email,
                "name": visitor.name,
                "phone": visitor.phone,
                "user_type": "visitor",
                "avatar": avatar_url,
                "created_at": visitor.date_joined
            })

        except VisitorUser.DoesNotExist:
            pass

        try:
            mizban = MizbanUser.objects.get(id=user.id)
            avatar_url = request.build_absolute_uri(mizban.avatar.url) if mizban.avatar else None

            return Response({
                "id": mizban.id,
                "username": mizban.username,
                "email": mizban.email,
                "name": mizban.name,
                "phone": mizban.phone,
                "user_type": "mizban",
                "province": mizban.province,
                "city": mizban.city,
                "hosting_type": mizban.hosting_type,
                "status": mizban.status,
                "avatar": avatar_url,
                "created_at": mizban.date_joined
            })

        except MizbanUser.DoesNotExist:
            return Response({"error": "User not found"}, status=404)


class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        data = request.data

        try:
            visitor = VisitorUser.objects.get(id=user.id)

            visitor.name = data.get("name", visitor.name)
            visitor.phone = data.get("phone", visitor.phone)
            if 'avatar' in request.FILES:
                visitor.avatar = request.FILES['avatar']

            visitor.save()
            avatar_url = request.build_absolute_uri(visitor.avatar.url) if visitor.avatar else None

            return Response({
                "id": visitor.id,
                "name": visitor.name,
                "phone": visitor.phone,
                "user_type": "visitor",
                "avatar": avatar_url
            })

        except VisitorUser.DoesNotExist:
            pass

        try:
            mizban = MizbanUser.objects.get(id=user.id)

            mizban.name = data.get("name", mizban.name)
            mizban.phone = data.get("phone", mizban.phone)
            mizban.city = data.get("city", mizban.city)
            mizban.province = data.get("province", mizban.province)
            if 'avatar' in request.FILES:
                mizban.avatar = request.FILES['avatar']

            mizban.save()
            avatar_url = request.build_absolute_uri(mizban.avatar.url) if mizban.avatar else None

            return Response({
                "id": mizban.id,
                "name": mizban.name,
                "phone": mizban.phone,
                "user_type": "mizban",
                "city": mizban.city,
                "province": mizban.province,
                "avatar": avatar_url
            })

        except MizbanUser.DoesNotExist:
            return Response({"error": "Profile not found"}, status=404)


class AdminMizbanUserManageView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk, *args, **kwargs):
        mizban_user = get_object_or_404(MizbanUser, pk=pk)
        new_status = request.data.get('status')

        if new_status in ['pending', 'approved', 'rejected']:
            mizban_user.status = new_status
            if new_status == 'rejected' and 'reject_reason' in request.data:
                mizban_user.reject_reason = request.data.get('reject_reason')
            elif new_status == 'approved':
                mizban_user.reject_reason = ""

            mizban_user.save()
            return Response({"message": f"وضعیت میزبان به {new_status} تغییر یافت."}, status=status.HTTP_200_OK)

        return Response({"error": "status failed"}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, *args, **kwargs):
        mizban_user = get_object_or_404(MizbanUser, pk=pk)
        mizban_user.delete()
        return Response({"message": "میزبان با موفقیت حذف شد."}, status=status.HTTP_204_NO_CONTENT)


class AdminVisitorUserManageView(APIView):
    permission_classes = [IsAdminUser] # فقط ادمین‌ها دسترسی دارند

    def delete(self, request, pk, *args, **kwargs):
        visitor_user = get_object_or_404(VisitorUser, pk=pk)
        visitor_user.delete()
        return Response({"message": "کاربر با موفقیت حذف شد."}, status=status.HTTP_204_NO_CONTENT)