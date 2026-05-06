from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (LoginView, CreateVisitorUserView,
                    VisitorUserListView, VisitorUserDetailView,
                    CreateMizbanUserView, MizbanUserListView,
                    MizbanUserDetailView, UserMeView, UpdateProfileView, AdminMizbanUserManageView,
                    AdminVisitorUserManageView)

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("me/", UserMeView.as_view(), name="user_me"),
    path("profile/", UpdateProfileView.as_view(), name="update_profile"),
    path("create-visitor-user/", CreateVisitorUserView.as_view(), name="create_visitor_user"),
    path("visitor-users/", VisitorUserListView.as_view(), name="visitors"),
    path("visitor-user/<int:pk>/", VisitorUserDetailView.as_view(), name="visitor-detail"),
    path("create-mizban-user/", CreateMizbanUserView.as_view(), name="create-mizban_user"),
    path("mizban-users/", MizbanUserListView.as_view(), name="mizban-list"),
    path("mizban-user/<int:pk>/", MizbanUserDetailView.as_view(), name="mizban-detail"),
    path('admin/mizban-users/<int:pk>/', AdminMizbanUserManageView.as_view(), name='admin-mizban-manage'),
    path('admin/visitor-users/<int:pk>/', AdminVisitorUserManageView.as_view(), name='admin-visitor-manage'),
    # path('logout/', LogoutView.as_view(), name='logout'),

]

