from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from .models import Article
from .serializers import ArticleSerializer
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .pagination import ArticlePagination



class ArticleListCreateView(generics.ListCreateAPIView):
    queryset = Article.objects.all().order_by("-created_at")
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = ArticlePagination

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # اضافه کردن یک بازدید
        instance.views += 1
        instance.save(update_fields=['views'])

        serializer = self.get_serializer(instance)
        return Response(serializer.data)


    def perform_create(self, serializer):
        user = self.request.user

        # بررسی دسترسی در بک‌اند (علاوه بر فرانت‌اند)
        is_admin = user.is_superuser or user.is_staff
        is_mizban = hasattr(user, 'mizbanuser')  # چک کردن اینکه آیا رکورد میزبان دارد یا خیر

        if not (is_admin or is_mizban):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("شما دسترسی لازم برای نوشتن مقاله را ندارید.")

        # ذخیره مقاله با کاربری که ریکوئست داده است
        serializer.save(author=user)


class ArticleRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_destroy(self, instance):
        if instance.author == self.request.user or self.request.user.is_superuser or self.request.user.is_staff:
            instance.delete()
        else:
            raise PermissionDenied("شما اجازه حذف این مقاله را ندارید.")

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views += 1
        instance.save(update_fields=['views'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class ToggleLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        article = get_object_or_404(Article, pk=pk)
        user = request.user

        if user in article.likes.all():
            article.likes.remove(user)
            liked = False
        else:
            article.likes.add(user)
            liked = True

        return Response({
            'likes_count': article.likes.count(),
            'is_liked': liked
        })