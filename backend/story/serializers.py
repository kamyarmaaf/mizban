from rest_framework import serializers
from .models import StoryModel

class StoryModelSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = StoryModel
        fields = ['id', 'author', 'author_name', 'title', 'location', 'content', 'image', 'views', 'likes_count', 'created_at']
        read_only_fields = ['author', 'views']

    def get_author_name(self,obj):
        try:
            if hasattr(obj.author, 'mizbanuser') and obj.author.mizbanuser.name:
                return obj.author.mizbanuser.name
            elif hasattr(obj.author, 'visitoruser') and obj.author.visitoruser.name:
                return obj.author.visitoruser.name
        except Exception:
            if obj.author and hasattr(obj.author, 'username'):
                return obj.author.username
            return "کاربر ناشناس"

    def get_likes_count(self, obj):
            return obj.likes.count()