from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from django.db.models.aggregates import Avg, Count
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from .models import Experience, ExperienceImage, ExperienceRatingModel, ExperienceComment, Booking
from .serializers import (ExperienceSerializer, ExperienceImageSerializer,
                          ExperienceListSerializer, ExperienceRatingSerializer, ExperienceCommentSerializer,
                          BookingSerializer, TouristBookingSerializer, ProviderBookingSerializer,
                          AdminCommentSerializer)
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import F
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
import json
import requests

# اطلاعات زرین‌پال (این مقدار را ترجیحا در settings.py قرار دهید و از آنجا بخوانید)
MERCHANT_ID = "f90ea9ea-eb40-4914-abc3-ac7f2800a9a7" # 36 کاراکتر مرچنت کد شما
ZP_API_REQUEST = "https://api.zarinpal.com/pg/v4/payment/request.json"
ZP_API_VERIFY = "https://api.zarinpal.com/pg/v4/payment/verify.json"
ZP_API_STARTPAY = "https://www.zarinpal.com/pg/StartPay/{authority}"

User = get_user_model()


class ExperienceListView(generics.ListAPIView):
    queryset = Experience.objects.filter(status="approved").order_by("created_at")
    serializer_class = ExperienceSerializer


class ExperienceDetailView(generics.RetrieveAPIView):
    queryset = Experience.objects.filter(status="approved")
    serializer_class = ExperienceSerializer
    lookup_field = "id"


class ExperienceCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if getattr(request.user, 'status', None) != 'approved':
            return Response(
                {"message": "حساب کاربری شما به عنوان میزبان هنوز تایید نشده است. اجازه ساخت تجربه جدید را ندارید."},
                status=status.HTTP_403_FORBIDDEN,
            )

        print(request.data)
        serializer = ExperienceSerializer(data=request.data)

        if serializer.is_valid():
            experience = serializer.save(provider=request.user)
            images = request.FILES.getlist('images')
            for index, img in enumerate(images):
                is_cover = (index == 0)
                ExperienceImage.objects.create(experience=experience, image=img, is_cover=is_cover)

            return Response(
                {
                    "message": "Experience and images created successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {"message": "Validation error", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )


class ExperienceImageUploadAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):

        experience_id = request.data.get("experience")

        if not experience_id:
            return Response(
                {"error": "experience id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            experience = Experience.objects.get(id=experience_id)
        except Experience.DoesNotExist:
            return Response(
                {"error": "experience not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        if experience.provider != request.user:
            return Response(
                {"error": "you are not allowed to upload image for this experience"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ExperienceImageSerializer(data=request.data)

        if serializer.is_valid():
            has_images = ExperienceImage.objects.filter(experience=experience).exists()
            serializer.save(experience=experience, is_cover=not has_images)

            return Response(
                {
                    "message": "image uploaded successfully",
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ExperienceUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        return self.update_experience(request, pk)

    def patch(self, request, pk):
        return self.update_experience(request, pk)

    def update_experience(self, request, pk):
        try:
            experience = Experience.objects.get(pk=pk)
        except Experience.DoesNotExist:
            return Response(
                {"error": "Experience not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        if experience.provider != request.user:
            return Response(
                {"error": "You are not allowed to edit this experience"},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = ExperienceSerializer(
            experience,
            data=request.data,
            partial=True  # اجازه patch
        )

        if serializer.is_valid():
            # 4) ذخیره آپدیت‌های متنی
            serializer.save()

            new_images = request.FILES.getlist('images')
            for img in new_images:
                ExperienceImage.objects.create(experience=experience, image=img)

            experience.status = "pending"
            experience.save(update_fields=["status"])

            return Response(
                {
                    "message": "Experience updated successfully",
                    "data": serializer.data
                },
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExperienceImageDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):

        try:
            image = ExperienceImage.objects.get(pk=pk)
        except ExperienceImage.DoesNotExist:
            return Response(
                {"error": "image not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # فقط صاحب تجربه اجازه حذف دارد
        if image.experience.provider != request.user:
            return Response(
                {"error": "you are not allowed to delete this image"},
                status=status.HTTP_403_FORBIDDEN
            )

        image.delete()

        return Response(
            {"message": "image deleted successfully"},
            status=status.HTTP_200_OK
        )


class MyExperienceView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        experiences = Experience.objects.filter(provider=request.user)
        serializer = ExperienceListSerializer(experiences, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RateExperienceView(generics.CreateAPIView):
    serializer_class = ExperienceRatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, experience_id):
        experience = Experience.objects.get(id=experience_id)
        rating_value = request.data.get('rating')

        if not rating_value or not (1 <= int(rating_value) <= 5):
            return Response({"error": "Rating must be between 1 and 5"}, status=400)
        rating_obj, created = ExperienceRatingModel.objects.update_or_create(
            experience=experience,
            user=request.user,
            defaults={'rating': float(rating_value)}
        )
        ratings = ExperienceRatingModel.objects.filter(experience=experience)
        avg_rating = ratings.aggregate(Avg('rating'))['rating__avg']
        total = ratings.count()
        return Response({
            "success": True,
            "rating": avg_rating,
            "totalRatings": total
            }, status=status.HTTP_200_OK
        )

class GetRateExperienceView(APIView):
    def get(self, request, experience_id):
        try:
            experience = Experience.objects.get(pk=experience_id)
        except Experience.DoesNotExist:
            return Response({"error": "Experience not found"}, status=404)

        ratings = ExperienceRatingModel.objects.filter(
            experience=experience
        )
        total_ratings = ratings.count()
        avg_rating = ratings.aggregate(Avg('rating'))['rating__avg']

        return Response({
            "avg_rating": avg_rating,  # میانگین کل
            "total_ratings": total_ratings,
        })



class ToggleFavoriteView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        try:
            experience = Experience.objects.get(pk=pk)
            user = request.user
            if user in experience.favorited_by.all():
                experience.favorited_by.remove(user)
                return Response({"status": "unfavorited"}, status=status.HTTP_200_OK)
            else:
                experience.favorited_by.add(user)
                return Response({"status": "favorited"}, status=status.HTTP_200_OK)
        except Experience.DoesNotExist:
            return Response({"error": "experience not found"}, status=404)


class FavoriteExperiencesListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ExperienceSerializer
    def get_queryset(self):
        return self.request.user.favorite_experiences.all()


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = ExperienceCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        experience_id = self.kwargs['experience_id']
        return ExperienceComment.objects.filter(experience_id=experience_id).order_by('-created_at')

    def perform_create(self, serializer):
        experience_id = self.kwargs['experience_id']
        experience = Experience.objects.get(id=experience_id)
        # یوزر را از ریکوئست می‌گیریم و ذخیره می‌کنیم
        serializer.save(user=self.request.user, experience=experience)

# حذف کامنت
class CommentDeleteView(generics.DestroyAPIView):
    queryset = ExperienceComment.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        # فقط نویسنده کامنت حق حذف آن را دارد
        if instance.user != self.request.user:
            raise PermissionDenied("شما اجازه حذف این نظر را ندارید.")
        instance.delete()


class ProviderStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        provider = request.user

        approved_experiences_count = Experience.objects.filter(
            provider=provider,
            status='approved'
        ).count()

        rating_stats = ExperienceRatingModel.objects.filter(
            experience__provider=provider
        ).aggregate(
            average_rating=Avg('rating'),
            total_ratings=Count('id')
        )

        avg_rating = rating_stats.get('average_rating') or 0.0
        total_ratings_count = rating_stats.get('total_ratings') or 0
        data = {
            'approved_experiences_count': approved_experiences_count,
            'average_rating': round(avg_rating, 2),
            'total_ratings_count': total_ratings_count,
        }

        return Response(data, status=status.HTTP_200_OK)


class ExperienceDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            experience = Experience.objects.get(pk=pk)
        except Experience.DoesNotExist:
            return Response(
                {"error": "Experience not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # فقط صاحب تجربه حق حذف دارد
        if experience.provider != request.user:
            return Response(
                {"error": "You are not allowed to delete this experience"},
                status=status.HTTP_403_FORBIDDEN
            )

        experience.delete()
        return Response(
            {"message": "Experience deleted successfully"},
            status=status.HTTP_200_OK
        )



class IsAdminUserOrReadOnly(permissions.IsAdminUser):
    def has_permission(self, request, view):
        return bool(request.user and (request.user.is_staff or request.user.is_superuser))


# --- ویوهای مربوط به مدیریت تجربه‌ها ---
class AdminExperienceListView(generics.ListAPIView):
    """دریافت لیست تمام تجربه‌ها (برای پنل ادمین)"""
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]
    queryset = Experience.objects.all().order_by('-created_at')
    serializer_class = ExperienceListSerializer


class AdminExperienceStatusUpdateView(APIView):
    """تغییر وضعیت تجربه توسط ادمین (تایید/رد)"""
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]

    def patch(self, request, pk):
        try:
            experience = Experience.objects.get(pk=pk)
        except Experience.DoesNotExist:
            return Response({"error": "Experience not found"}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status")
        if new_status in ["approved", "rejected", "pending"]:
            experience.status = new_status
            experience.save(update_fields=["status"])
            return Response({"message": f"Experience status updated to {new_status}"}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)


# --- ویوهای مربوط به مدیریت کاربران (میتواند در اپ اکانت باشد) ---
# فرض میکنیم یک سریالایزر ساده برای یوزر دارید
class AdminUserListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        data = []
        for u in users:
            data.append({
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "is_active": u.is_active,
                "is_staff": u.is_staff,
                "role": getattr(u, 'user_type', 'user'),  # بسته به مدل شما
                "date_joined": u.date_joined
            })
        return Response(data, status=status.HTTP_200_OK)


class AdminCommentListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]
    queryset = ExperienceComment.objects.all().order_by('-created_at')
    serializer_class = AdminCommentSerializer

class AdminCommentDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]

    def delete(self, request, pk):
        try:
            comment = ExperienceComment.objects.get(pk=pk)
            comment.delete()
            return Response({"message": "Comment deleted successfully"}, status=status.HTTP_200_OK)
        except ExperienceComment.DoesNotExist:
            return Response({"error": "Comment not found"}, status=status.HTTP_404_NOT_FOUND)


class AllExperienceAPIView(generics.RetrieveAPIView):
    serializer_class = ExperienceSerializer
    queryset = Experience.objects.all().order_by('-created_at')
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]
    lookup_field = "id"


class BookingCreateAPIView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated] # فقط کاربران لاگین شده

    # موقع ذخیره کردن، کاربری که ریکوئست داده را به عنوان صاحب رزرو ثبت می‌کنیم
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_payment(request):
    try:
        data = request.data
        experience_id = data.get('experience')
        guests = data.get('guests')
        total_price = data.get(
            'total_price')  # مبلغ کل (به ریال برای زرین‌پال، فرض میکنیم فرانت تومان فرستاده و اینجا تبدیل میکنیم)
        callback_url = data.get('callback_url')  # آدرس برگشت به فرانت‌اند

        experience = get_object_or_404(Experience, id=experience_id)

        # ۱. ایجاد رزرو موقت در دیتابیس
        booking = Booking.objects.create(
            user=request.user,
            experience=experience,
            guests=guests,
            total_price=total_price,
            status='paid'
        )
        booking.save()
        return Response({'message': 'رزرو با موفقیت ثبت شد (بدون درگاه)'}, status=status.HTTP_201_CREATED)

        # ۲. ارسال درخواست به زرین‌پال
        # زرین‌پال مبالغ را به ریال دریافت می‌کند. اگر total_price تومان است آن را * 10 کنید
        # req_data = {
        #     "merchant_id": MERCHANT_ID,
        #     "amount": int(total_price) * 10,  # تبدیل به ریال
        #     "callback_url": callback_url,
        #     "description": f"رزرو تجربه {experience.title} برای {guests} نفر",
        #     "metadata": {"mobile": request.user.phone_number if hasattr(request.user, 'phone_number') else ""}
        # }
        #
        # response = requests.post(ZP_API_REQUEST, data=json.dumps(req_data),
        #                          headers={'content-type': 'application/json'})
        # result = response.json()

    #     if len(result['errors']) == 0:
    #         authority = result['data']['authority']
    #
    #         # ۳. ذخیره Authority در دیتابیس برای پیگیری بعدی
    #         booking.authority = authority
    #         booking.save()
    #
    #         # ۴. ارسال لینک پرداخت به فرانت‌اند
    #         payment_url = ZP_API_STARTPAY.format(authority=authority)
    #         return Response({'payment_url': payment_url}, status=status.HTTP_200_OK)
    #     else:
    #         return Response({'error': 'خطا در ساخت تراکنش'}, status=status.HTTP_400_BAD_REQUEST)
    #
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
# در اینجا نیاز به IsAuthenticated نیست چون درگاه کاربر را به این آدرس هدایت می‌کند
# و ممکن است هدرهای احراز هویت فرانت‌اند همراه درخواست نباشد (فرانت‌اند این API را صدا می‌زند)
def verify_payment(request):
    authority = request.GET.get('authority')

    if not authority:
        return Response({'error': 'کد authority ارسال نشده است.'}, status=status.HTTP_400_BAD_REQUEST)

    # پیدا کردن رزرو مربوط به این authority
    booking = get_object_or_404(Booking, authority=authority)

    if booking.status == 'paid':
        return Response({'message': 'این تراکنش قبلا پرداخت شده است.'}, status=status.HTTP_200_OK)

    # ارسال درخواست تایید به زرین‌پال
    req_data = {
        "merchant_id": MERCHANT_ID,
        "amount": int(booking.total_price) * 10,  # مبلغ باید دقیقا همان مبلغ ایجاد شده (به ریال) باشد
        "authority": authority
    }

    response = requests.post(ZP_API_VERIFY, data=json.dumps(req_data), headers={'content-type': 'application/json'})
    result = response.json()

    if len(result['errors']) == 0:
        if result['data']['code'] == 100 or result['data']['code'] == 101:
            # پرداخت موفقیت آمیز بود
            booking.status = 'paid'
            booking.ref_id = result['data']['ref_id']  # ذخیره شماره پیگیری
            booking.save()
            return Response({'message': 'پرداخت با موفقیت انجام شد.', 'ref_id': booking.ref_id},
                            status=status.HTTP_200_OK)
        else:
            booking.status = 'failed'
            booking.save()
            return Response({'error': 'پرداخت ناموفق بود.'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        booking.status = 'failed'
        booking.save()
        return Response({'error': 'تراکنش یافت نشد یا خطا از سمت درگاه.'}, status=status.HTTP_400_BAD_REQUEST)




# رزرو های من
class MyBookingsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(
            user=request.user
        ).select_related('experience').prefetch_related('experience__images').order_by('-created_at')

        serializer = TouristBookingSerializer(bookings, many=True)
        return Response(serializer.data)



class ProviderBookingsListView(generics.ListAPIView):
    serializer_class = ProviderBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(experience__provider=self.request.user).order_by('-created_at')


# class AdminCommentListView(generics.ListAPIView):
#     queryset = ExperienceComment.objects.all().order_by('-created_at')
#     serializer_class = AdminCommentSerializer
#     permission_classes = [IsAdminUser]
#
# class AdminCommentDetailView(generics.DestroyAPIView):
#     """حذف نظرات توسط مدیر"""
#     queryset = ExperienceComment.objects.all()
#     # اینجا چون ادمین است، هر نظری را بخواهد می‌تواند حذف کند و نیازی به چک کردن نویسنده نیست
#     permission_classes = [IsAdminUser]