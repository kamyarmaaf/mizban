from django.db import models
from django.conf import settings
# Create your models here.


class Article(models.Model):
    title = models.CharField(max_length=255, verbose_name="عنوان مقاله")
    content = models.TextField(max_length=2000, verbose_name="متن مقاله")
    address = models.CharField(max_length=300, verbose_name="آدرس")
    views = models.PositiveIntegerField(default=0)
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_articles', blank=True)
    cover_image = models.ImageField(upload_to='articles/covers/', null=True, blank=True, verbose_name="عکس کاور")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='articles', verbose_name="نویسنده")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاریخ ویرایش")

    class Meta:
        verbose_name = "مقاله"
        verbose_name_plural = "مقالات"
        ordering = ['-created_at']

    def __str__(self):
        return self.title