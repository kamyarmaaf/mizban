from django.contrib import admin
from .models import VisitorUser, MizbanUser


admin.site.register(VisitorUser)
admin.site.register(MizbanUser)