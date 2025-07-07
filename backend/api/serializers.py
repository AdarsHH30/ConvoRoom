import pickle
from backend.api.models import Room, RoomMember


class RoomSerializer:
    def serialize(self, obj):
        data = {
            "id": obj.id,
            "name": obj.name,
            "created_at": obj.created_at,
            "member_count": obj.members.count(),
        }
        return pickle.dumps(data)

    def deserialize(self, data):
        return pickle.loads(data)


class RoomMemberSerializer:
    def serialize(self, obj):
        data = {
            "id": obj.id,
            "room": obj.room.id,
            "username": obj.user.username,
            "is_active_speaker": obj.is_active_speaker,
            "joined_at": obj.joined_at,
        }
        return pickle.dumps(data)

    def deserialize(self, data):
        return pickle.loads(data)


# from rest_framework import serializers

# from backend.api.models import *


# class RoomSerializer(serializers.ModelSerializer):
#     member_count = serializers.SerializerMethodField()

#     class Meta:
#         model = Room
#         fields = ["id", "name", "created_at", "member_count"]

#     def get_member_count(self, obj):
#         return obj.members.count()


# class RoomMemberSerializer(serializers.ModelSerializer):
#     username = serializers.CharField(source="user.username", read_only=True)

#     class Meta:
#         model = RoomMember
#         fields = ["id", "room", "username", "is_active_speaker", "joined_at"]
