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


class TouristBookingSerializer(serializers.ModelSerializer):
    experience_title = serializers.CharField(source='experience.title', read_only=True)
    experience_date = serializers.CharField(source='experience.date', read_only=True)
    experience_price = serializers.IntegerField(source='total_price', read_only=True)
    experience_image = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id',
            'status',
            'experience_title',
            'experience_date',
            'experience_price',
            'experience_image',
            'created_at',
        ]

    def get_experience_image(self, obj):
        image = obj.experience.images.filter(is_cover=True).first()
        if image:
            return image.image.url
        return None


class SimpleUserBookingSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'username']

    def get_name(self, obj):
        try:
            if hasattr(obj, 'mizbanuser') and obj.mizbanuser.name:
                return obj.mizbanuser.name
            elif hasattr(obj, 'visitoruser') and obj.visitoruser.name:
                return obj.visitoruser.name
        except Exception:
            pass
        return obj.username or "کاربر ناشناس"


class SimpleExperienceBookingSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Experience
        fields = ['id', 'title', 'image', 'date']

    def get_image(self, obj):
        # گرفتن عکس کاور برای نمایش در جدول
        cover = obj.images.filter(is_cover=True).first()
        if cover and cover.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(cover.image.url)
            return cover.image.url
        return None


#  سریالایزر اصلی برای رزروهای داشبورد میزبان
class ProviderBookingSerializer(serializers.ModelSerializer):
    experience = SimpleExperienceBookingSerializer(read_only=True)
    user = SimpleUserBookingSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'experience', 'user', 'guests', 'total_price', 'status', 'created_at']


class AdminCommentSerializer(serializers.ModelSerializer):
    experience_title = serializers.CharField(source='experience.title', read_only=True)
    text = serializers.CharField(source='comment', read_only=True) # تبدیل comment به text
    user_name = serializers.SerializerMethodField()
    reported = serializers.SerializerMethodField()

    class Meta:
        model = ExperienceComment
        fields = ['id', 'experience_title', 'user_name', 'text', 'created_at', 'reported']

    def get_user_name(self, obj):
        try:
            if hasattr(obj.user, 'mizbanuser') and obj.user.mizbanuser.name: return obj.user.mizbanuser.name
            elif hasattr(obj.user, 'visitoruser') and obj.user.visitoruser.name: return obj.user.visitoruser.name
        except: pass
        return obj.user.username if obj.user else "ناشناس"

    def get_reported(self, obj):
        return False # چون در مدل ندارید، فعلا False می‌فرستیم تا فرانت‌اند خطا ندهد