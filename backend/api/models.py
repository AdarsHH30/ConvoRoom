from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
import uuid


# class ChatRoom(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     name = models.CharField(max_length=100, default=id)
#     # created_by = models.ForeignKey(
#         # User, on_delete=models.CASCADE, related_name="created_rooms"
#     # )
#     created_at = models.DateTimeField(auto_now_add=True)
#     is_active = models.BooleanField(default=True)
#     max_participants = models.IntegerField(default=4)

#     class Meta:
#         ordering = ["-created_at"]

#     def clean(self):
#         active_participants = self.participants.filter(is_active=True).count()
#         if active_participants >= self.max_participants:
#             raise ValidationError(
#                 f"Room cannot have more than {self.max_participants} participants"
#             )


#     def __str__(self):
#         return f"{self.name} ({self.id})"
class ChatRoom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    # created_by = models.ForeignKey(
    #     User, on_delete=models.CASCADE, related_name="created_rooms"
    # )
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    max_participants = models.IntegerField(default=4)

    class Meta:
        ordering = ["-created_at"]

    def clean(self):
        active_participants = self.participants.filter(is_active=True).count()
        if active_participants >= self.max_participants:
            raise ValidationError(
                f"Room cannot have more than {self.max_participants} participants"
            )

    def __str__(self):
        return f"{self.name} ({self.id})"


class RoomParticipant(models.Model):
    room = models.ForeignKey(
        ChatRoom, related_name="participants", on_delete=models.CASCADE
    )
    user = models.ForeignKey(User, related_name="chat_rooms", on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("room", "user")
        ordering = ["joined_at"]

    def __str__(self):
        return f"{self.user.username} in {self.room.name}"


class ChatMessage(models.Model):
    room = models.ForeignKey(
        ChatRoom, related_name="messages", on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        User,
        related_name="messages",
        on_delete=models.CASCADE,
        null=True,  # Null for AI responses
        blank=True,
    )
    is_ai_response = models.BooleanField(default=False)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]

    def __str__(self):
        sender = "AI" if self.is_ai_response else self.user.username
        return f"Message from {sender} in {self.room.name}"
