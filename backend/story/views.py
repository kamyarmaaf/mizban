from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import StoryModel
from .serializers import StoryModelSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from .pagination import StoryPagination

class StoryListCreateAPIView(generics.ListCreateAPIView):
    queryset = StoryModel.objects.all().order_by('-created_at')
    serializer_class = StoryModelSerializer
    pagination_class = StoryPagination
    parser_classes = [MultiPartParser, FormParser]



    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class StoryDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StoryModel.objects.all().order_by('-created_at')
    serializer_class = StoryModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views += 1
        instance.save(update_fields=['views'])
        serializer = self.get_serializer(instance)
        data = serializer.data
        user = request.user
        if user.is_authenticated:
            data['is_liked'] = instance.likes.filter(id=user.id).exists()
        else:
            data['is_liked'] = False

        return Response(data)

class ToggleStoryLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        story = get_object_or_404(StoryModel, pk=pk)
        user = request.user

        if story.likes.filter(id=user.id).exists():
            story.likes.remove(user)
            is_liked = False
        else:
            story.likes.add(user)
            is_liked = True

        return Response({
            'is_liked': is_liked,
            'likes_count': story.likes.count()
        }, status=status.HTTP_200_OK)