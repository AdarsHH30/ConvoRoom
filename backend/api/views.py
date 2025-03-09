from django.shortcuts import render
from django.http import JsonResponse
import json
import os
import uuid
from dotenv import load_dotenv
from rest_framework.decorators import api_view
from rest_framework.response import Response
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from pymongo import MongoClient
from datetime import datetime

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

chat = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=API_KEY)
memory = ConversationBufferMemory(return_messages=True)
conversation = ConversationChain(llm=chat, memory=memory, verbose=False)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["convo_room"]
messages_collection = db["messages"]


@api_view(["POST"])
def getReactData(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
        user_message = data.get("message", "").strip()
        room_id = data.get("roomId", "").strip()

        if not user_message or not room_id:
            return Response({"error": "Invalid request"}, status=400)

        ai_response = conversation.predict(input=user_message)

        collection = db["messages"]
        collection.insert_one(
            {
                "room_id": room_id,
                "sender": "User",
                "message": user_message,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

        collection.insert_one(
            {
                "room_id": room_id,
                "sender": "AI",
                "message": ai_response,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"room_{room_id}",
            {"type": "chat_message", "message": ai_response, "username": "AI"},
        )

        return Response({"response": ai_response}, status=200)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
def get_chat_history(request, room_id):
    try:
        chat_history = list(
            messages_collection.find({"room_id": room_id}, {"_id": 0}).sort("timestamp")
        )
        print(chat_history)
        return JsonResponse({"messages": chat_history}, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


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
            return Response({"error": "Room is full"}, status=403)
    else:
        return Response({"error": "Room not found or does not exist"}, status=404)


@api_view(["POST"])
def insert_data(request):
    try:
        collection = db["mycollection"]
        data = {"message": "Hello MongoDB"}
        collection.insert_one(data)
        return JsonResponse({"status": "Data Inserted"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
