from django.contrib import admin
from .models import Experience, ExperienceRatingModel
# Register your models here.

class ExperienceAdmin(admin.ModelAdmin):
    model = Experience


admin.site.register(Experience, ExperienceAdmin)
admin.site.register(ExperienceRatingModel)

