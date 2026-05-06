from django.urls import path
from . import views

urlpatterns = [
    path('', views.StoryListCreateAPIView.as_view(), name='story-list-create'),
    path('<int:pk>/', views.StoryDetailAPIView.as_view(), name='story-detail'),
    path('<int:pk>/like/', views.ToggleStoryLikeView.as_view(), name='story-like'),
]