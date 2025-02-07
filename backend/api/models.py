from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class Room(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    MAX_MEMBERS = 4
    is_empty = models.BooleanField(auto_created=False)

    def clean(self):
        if self.members.count() > self.MAX_MEMBERS:
            raise ValidationError(
                f"Room cannot have more than {self.MAX_MEMBERS} members"
            )


class RoomMember(models.Model):
    room = models.ForeignKey(Room, related_name="members", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="rooms", on_delete=models.CASCADE)
    is_active_speaker = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("room", "user")
