import uuid
from mongoengine import (
    Document,
    StringField,
    EmailField,
    ReferenceField,
    DateTimeField,
    BooleanField,
    IntField,
    ListField,
)


# User model
class User(Document):
    username = StringField(required=True, unique=True)
    email = EmailField(required=True, unique=True)

    def __str__(self):
        return self.username


# Chat Room model
class ChatRoom(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    name = StringField(required=True, unique=True)
    created_by = ReferenceField(User, required=True)
    created_at = DateTimeField()
    is_active = BooleanField(default=True)
    max_participants = IntField(default=4)
    participants = ListField(ReferenceField(User))

    def clean(self):
        """Ensure the room does not exceed the max participants."""
        if len(self.participants) > self.max_participants:
            raise ValidationError(
                f"Room cannot have more than {self.max_participants} participants"
            )

    def __str__(self):
        return f"{self.name} ({self.id})"


# Chat Message model
class ChatMessage(Document):
    room = ReferenceField(ChatRoom, required=True)
    user = ReferenceField(User, null=True)  # Null for AI responses
    is_ai_response = BooleanField(default=False)
    content = StringField(required=True)
    timestamp = DateTimeField()

    def __str__(self):
        sender = (
            "AI"
            if self.is_ai_response
            else (self.user.username if self.user else "Unknown")
        )
        return f"Message from {sender} in {self.room.name}"
