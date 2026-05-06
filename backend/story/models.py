from django.db import models
from django.conf import settings


class StoryModel(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='stories')
    title = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    content = models.TextField()
    image = models.ImageField(upload_to='stories/images/')

    # فیلدهای اضافی برای امکانات احتمالی (مثل مقالات)
    views = models.PositiveIntegerField(default=0)
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_stories', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
