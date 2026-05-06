from django.urls import path
from .views import ArticleListCreateView, ArticleRetrieveUpdateDestroyView, ToggleLikeView

urlpatterns = [
    path('', ArticleListCreateView.as_view(), name='article-list-create'),
    path('<int:pk>/', ArticleRetrieveUpdateDestroyView.as_view(), name='article-detail'),
    path('<int:pk>/like/', ToggleLikeView.as_view(), name='article-like'),
]
