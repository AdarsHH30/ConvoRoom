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
import threading

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

chat = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=API_KEY)

room_conversations = {}

MONGO_URI = os.getenv("DATABASE_URL")
if MONGO_URI is None:
    raise ValueError("DATABASE_URL environment variable not set")


client = MongoClient(MONGO_URI)
db = client["convoroom"]
messages_collection = db["messages"]
# print("Rooms Collection:", messages_collection)


@api_view(["POST"])
def getReactData(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
        user_message = data.get("message", "").strip()
        room_id = data.get("roomId", "").strip()
        username = data.get("username", "User")  # Make sure username is extracted

        if not user_message or not room_id:
            return Response({"error": "Invalid request"}, status=400)

        if room_id not in room_conversations:
            memory = ConversationBufferMemory(return_messages=True)
            room_conversations[room_id] = ConversationChain(
                llm=chat, memory=memory, verbose=False
            )

            room_conversations[room_id].predict(
                input=(
                    os.getenv(
                        "Prompt",
                        "Welcome to the chat room! How can I assist you today?",
                    )
                )
            )

        room_chat_history = list(
            messages_collection.find({"room_id": room_id}, {"_id": 0}).sort("timestamp")
        )[-5:]

        context = ""
        for msg in room_chat_history:
            context += f"{msg['sender']}: {msg['message']}\n"

        ai_response = room_conversations[room_id].predict(
            input=f"Previous messages in this room:\n{context}\n\nUser's new message: {user_message}"
        )

        collection = db["messages"]

        collection.insert_one(
            {
                "room_id": room_id,
                "sender": username,
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
        return JsonResponse({"messages": chat_history}, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["GET"])
def hello_world(request):
    return Response({"message": "Hello from Django!"})


rooms = {}


@api_view(["POST"])
def create_room(request):
    try:
        room_id = request.data.get("roomId", str(uuid.uuid4())[:8])

        rooms[room_id] = {"participants": 0, "max_participants": 4}

        response = {
            "success": True,
            "message": "Room created successfully",
            "roomId": room_id,
        }

        # Start background task for non-critical operations

        threading.Thread(
            target=initialize_room_resources,
            args=(room_id, request.data.get("room_name", "New Room")),
        ).start()

        return Response(response)
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


def initialize_room_resources(room_id, room_name):
    """Perform non-critical initialization tasks in background"""
    try:
        # Store in MongoDB asynchronously
        room_data = {
            "room_id": room_id,
            "name": room_name,
            "created_at": datetime.utcnow().isoformat(),
            "participants": 0,
            "max_participants": 4,
            "active": True,
        }
        db["rooms"].insert_one(room_data)

        # Initialize AI conversation if needed
        if room_id not in room_conversations:
            memory = ConversationBufferMemory(return_messages=True)
            room_conversations[room_id] = ConversationChain(
                llm=chat, memory=memory, verbose=False
            )
    except Exception as e:
        print(f"Error in background initialization: {e}")


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
