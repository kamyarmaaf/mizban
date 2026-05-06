from rest_framework import serializers
from .models import Experience, ExperienceImage, ExperienceRatingModel, ExperienceComment, Booking
from django.contrib.auth import get_user_model
from django.db.models import Avg



User = get_user_model()

class ExperienceImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ExperienceImage
        fields = ["id", "experience", "image", "is_cover"]
        read_only_fields = ["experience"]


class ExperienceSerializer(serializers.ModelSerializer):
    images = ExperienceImageSerializer(many=True, read_only=True)
    provider_name = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Experience
        fields = [
            "id",
            "provider",
            "provider_name",
            "title",
            "description",
            "category",
            "price",
            "capacity",
            "duration",
            "province",
            "city",
            "address",
            "status",
            "created_at",
            "images",
            "date",
            "time",
            "rating",
            "is_favorited",
        ]

        read_only_fields = ["provider", "status"]

    def get_provider_name(self, obj):
        try:
            if hasattr(obj.provider, 'mizbanuser') and obj.provider.mizbanuser.name:
                return obj.provider.mizbanuser.name
            return obj.provider.username
        except Exception:
            return obj.provider.username

    def get_rating(self, obj):
        avg = ExperienceRatingModel.objects.filter(experience=obj).aggregate(Avg('rating'))['rating__avg']

        # اگر امتیازی وجود داشت میانگین را (با یک رقم اعشار) برمی‌گرداند، در غیر این صورت 0
        if avg is not None:
            return round(avg, 1)
        return 0
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(id=request.user.id).exists()
        return False


class ExperienceListSerializer(serializers.ModelSerializer):
    images = ExperienceImageSerializer(many=True, read_only=True)
    rating = serializers.SerializerMethodField()
    class Meta:
        model = Experience
        fields = "__all__"

    def get_rating(self, obj):
        avg = ExperienceRatingModel.objects.filter(experience=obj).aggregate(Avg('rating'))['rating__avg']

        # اگر امتیازی وجود داشت میانگین را (با یک رقم اعشار) برمی‌گرداند، در غیر این صورت 0
        if avg is not None:
            return round(avg, 1)
        return 0


class ExperienceRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExperienceRatingModel
        fields = ['id', 'experience', 'user', 'rating', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']


class ExperienceCommentSerializer(serializers.ModelSerializer):
    # مپ کردن فیلدهای جنگو به نام‌هایی که فرانت‌اند می‌خواهد
    userName = serializers.SerializerMethodField()
    userId = serializers.IntegerField(source='user.id', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = ExperienceComment
        fields = ['id', 'userName', 'userId', 'comment', 'createdAt']

    def get_userName(self,obj):
        try:
            if hasattr(obj.user, 'mizbanuser') and obj.user.mizbanuser.name:
                return obj.user.mizbanuser.name
            elif hasattr(obj.user, 'visitoruser') and obj.user.visitoruser.name:
                return obj.user.visitoruser.name
        except Exception:
            if obj.user and hasattr(obj.user, 'username'):
                return obj.user.username
            return "کاربر ناشناس"


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'experience', 'guests', 'total_price', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']

    def validate(self, data):
        if data['guests'] > data['experience'].capacity:
            raise serializers.ValidationError("تعداد نفرات بیشتر از ظرفیت تجربه است.")
        return data