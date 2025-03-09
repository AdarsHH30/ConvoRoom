from django.shortcuts import render
import json, os, uuid
from dotenv import load_dotenv
from rest_framework.decorators import api_view
from rest_framework.response import Response
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.http import JsonResponse

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
chat = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=API_KEY)
memory = ConversationBufferMemory(return_messages=True)
conversation = ConversationChain(llm=chat, memory=memory, verbose=False)


@api_view(["POST"])
def getReactData(request):
    print("we are inside getReactData")
    try:
        data = json.loads(request.body.decode("utf-8"))  # Ensure UTF-8 decoding
        user_message = data.get("message", "").strip()
        room_id = data.get("roomId", "").strip()

        if not user_message or not room_id:
            return Response(
                {"error": "Invalid request - Missing 'message' or 'roomId'"}, status=400
            )

        # Get AI response (Ensure `conversation` is correctly imported)
        ai_response = conversation.predict(input=user_message)
        print(f"AI Response: {ai_response}")  # Debugging

        # Send AI response to all WebSocket clients in the room
        channel_layer = get_channel_layer()
        print(f"Sending message to room {room_id}: {ai_response}")
        async_to_sync(channel_layer.group_send)(
            f"room_{room_id}",
            {
                "type": "chat_message",
                "message": ai_response,
                "username": "AI",
            },
        )
        print("Message sent to WebSocket group")

        return Response({"response": ai_response}, status=200)

    except json.JSONDecodeError:
        return Response({"error": "Invalid JSON format"}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
def hello_world(request):
    return Response({"message": "Hello from Django!"})


rooms = {}


@api_view(["POST"])
def create_room(request):
    room_id = (str(uuid.uuid4())[:6]).upper()
    rooms[room_id] = {"participants": 0, "max_participants": 4}
    return Response({"roomId": room_id})


@api_view(["POST"])
def join_room(request):
    room_id = request.data.get("roomId")
    if room_id in rooms:
        if rooms[room_id]["participants"] < rooms[room_id]["max_participants"]:
            rooms[room_id]["participants"] += 1
            return Response({"message": "Joined room successfully"})
    else:
        return Response({"error": "Room not found or does not exist"}, status=404)


def insert_data(request):
    collection = db["mycollection"]
    data = {"message": "Hello MongoDB"}
    collection.insert_one(data)
    return JsonResponse({"status": "Data Inserted"})
