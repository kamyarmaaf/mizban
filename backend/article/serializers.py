from rest_framework import serializers
from .models import Article

class ArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField() # تعداد لایک‌ها
    is_liked = serializers.SerializerMethodField()    # آیا کاربر لاگین شده لایک کرده یا نه؟

    class Meta:
        model = Article
        fields = ['id', 'title', 'content', 'address', 'cover_image', 'author', 'author_name', 'created_at', 'updated_at', 'views', 'likes_count', 'is_liked']
        read_only_fields = ['author', 'created_at', 'views', 'likes_count', 'is_liked']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_author_name(self, obj):
        try:
            # بررسی می‌کنیم که آیا کاربر پروفایل میزبان دارد و نامش ثبت شده یا نه
            if hasattr(obj.author, 'mizbanuser') and obj.author.mizbanuser.name:
                return obj.author.mizbanuser.name

            return obj.author.username

        except Exception:
            # در صورت بروز هرگونه خطا، یوزرنیم را برمی‌گرداند
            if obj.author and hasattr(obj.author, 'username'):
                return obj.author.username
            return "مدیر میزبان"