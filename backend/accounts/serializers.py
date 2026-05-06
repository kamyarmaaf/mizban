from rest_framework import serializers
from .models import VisitorUser, MizbanUser
from  django.contrib.auth.hashers import make_password


class VisitorUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = VisitorUser
        fields = '__all__'


class VisitorUserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitorUser
        fields = ['id', 'username', 'email','phone', 'name', 'avatar']

class VisitorsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitorUser
        exclude = ('password',)

class MizbanUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = MizbanUser
        fields = ['id', 'username', 'email',
                  'phone', 'name','province',
                  'city', 'hosting_type',
                  'status', 'user_type',
                  'avatar']
        read_only_fields = ['id', 'status', 'user_type']



class MizbanUserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = MizbanUser
        fields = ['id', 'username', 'email','phone', 'name','province','city','hosting_type','date_joined', 'avatar', 'status']


class MizbanUserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = MizbanUser
        fields = '__all__'



