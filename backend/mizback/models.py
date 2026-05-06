from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


# Create your models here.


class Experience(models.Model):
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='experiences',
        null=True,
        blank=True
    )

    CATEGORY_CHOICES = [
        ('غذا و نوشیدنی', 'غذا و نوشیدنی'),
        ('طبیعت و کوهنوردی', 'طبیعت و کوهنوردی'),
        ('گردشگری فرهنگی', 'گردشگری فرهنگی'),
        ('ماجراجویی', 'ماجراجویی'),
        ('عکاسی و هنر', 'عکاسی و هنر'),
    ]
    status = models.CharField(
        max_length=20,
        choices=[
            ("draft", "پیش‌نویس"),
            ("pending", "در انتظار تایید"),
            ("approved", "تایید شده"),
            ("rejected", "رد شده"),
        ],
        default="pending"
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.PositiveIntegerField()
    province = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=100)
    region = models.CharField(max_length=100, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    date = models.CharField(max_length=20)
    time = models.CharField(max_length=20)
    duration = models.CharField(max_length=50)
    address = models.TextField(blank=True, null=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    capacity = models.IntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)
    favorited_by  = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='favorite_experiences', blank=True)

    def __str__(self):
        return self.title


class ExperienceImage(models.Model):

    experience = models.ForeignKey(
        Experience,
        on_delete=models.CASCADE,
        related_name="images"
    )

    image = models.ImageField(upload_to="experiences/")

    is_cover = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.experience.title}"


class ExperienceRatingModel(models.Model):
    experience = models.ForeignKey(Experience, on_delete=models.CASCADE, related_name="ratings")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1),MaxValueValidator(5)])  # 1–5
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("experience", "user")

    def __str__(self):
        return f"{self.user} → {self.experience} ({self.rating})"


class ExperienceComment(models.Model):
    experience = models.ForeignKey('Experience', on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    comment = models.TextField(max_length=500) # دقیقاً مطابق نام پراپ در فرانت‌اند
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.experience.title}"



class Booking(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    experience = models.ForeignKey(Experience, on_delete=models.CASCADE, related_name='bookings')
    guests = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=0)
    STATUS_CHOICES = (
        ('pending', 'در انتظار پرداخت'),
        ('paid', 'پرداخت شده'),
        ('failed', 'ناموفق'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    authority = models.CharField(max_length=100, blank=True, null=True)  # کد دریافتی از درگاه
    ref_id = models.CharField(max_length=100, blank=True, null=True)  # شماره تراکنش نهایی
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.status}"


