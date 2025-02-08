import json  # for json data conversion
from channels.generic.websocket import AsyncJsonWebsocketConsumer


class ChatConsumer(AsyncJsonWebsocketConsumer):
    # This class handles all WebSocket connections. It inherits from AsyncWebsocketConsumer
    # which provides async websocket functionality
    async def connect(self):
        # This method is called when a WebSocket connection is first established

        # Get the room_id from the URL route parameters
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        # scope is like Django's request object, containing metadata about the connection
        # We extract the room_id that was passed in the WebSocket URL

        # Create a unique group name for this room
        self.room_group_name = f"chat_{self.room_id}"
        # Each room gets its own group name, prefixed with 'chat_'
        # This allows us to broadcast messages to everyone in the same room

        # Join the room group
        await self.channel_layer.group_add(
            self.room_group_name,  # The group name we created
            self.channel_name,  # Unique channel name for this connection
        )
        # This adds the current connection to the room group
        # channel_layer handles the group management
        # channel_name is automatically generated for each connection

        await self.accept()
        # Accepts the WebSocket connection
        # If you don't call accept(), the connection will be rejected

    async def disconnect(self, close_code):
        # Called when the WebSocket closes for any reason

        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        # Removes this connection from the room group
        # This ensures we don't try to send messages to disconnected clients

    async def chat_message(self, event):
        # Called when a message is received from the room group
        # The 'type': 'chat_message' in group_send calls this method

        # Extract the message and sender from the event
        message = event["message"]
        sender = event["sender"]

        # Send the message to the WebSocket
        await self.send(text_data=json.dumps({"message": message, "sender": sender}))
        # This sends the message to the client through the WebSocket connection
