from rest_framework import serializers

from backend.api.models import *


class RoomSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = ["id", "name", "created_at", "member_count"]

    def get_member_count(self, obj):
        return obj.members.count()


class RoomMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = RoomMember
        fields = ["id", "room", "username", "is_active_speaker", "joined_at"]
