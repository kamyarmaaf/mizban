from django.db import models
from django.contrib.auth.models import User

class VisitorUser(User):

    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, unique=True)
    user_type = models.CharField(max_length=100, default='visitor', null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/visitors/', null=True, blank=True, verbose_name="تصویر پروفایل")

    def __str__(self):
        return f"{self.phone} - {self.name} - {self.user_type}"


class MizbanUser(User):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, unique=True)
    user_type = models.CharField(max_length=100, default='mizban', null=True, blank=True)
    province = models.CharField(max_length=100, null=True, blank=True, verbose_name="استان")
    city = models.CharField(max_length=100, null=True, blank=True, verbose_name="شهر")
    hosting_type = models.CharField(max_length=100, null=True, blank=True, verbose_name="نوع میزبانی")
    avatar = models.ImageField(upload_to='avatars/mizbans/', null=True, blank=True, verbose_name="تصویر پروفایل")
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'در انتظار تایید'),
        ('approved', 'تایید شده'),
        ('rejected', 'رد شده'),
    ])
    reject_reason = models.TextField(null=True, blank=True, verbose_name="reject reason")

    def __str__(self):
        return f"{self.phone} - {self.name} - {self.user_type}"

    class Meta:
        verbose_name = "میزبان"
        verbose_name_plural = "میزبان ها"



