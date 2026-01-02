from django.shortcuts import render
from django.http import JsonResponse
import json
import os
import uuid
from dotenv import load_dotenv
from rest_framework.decorators import api_view
from rest_framework.response import Response
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.chat_history import BaseChatMessageHistory, InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from pymongo import MongoClient
from datetime import datetime
import threading

load_dotenv()

# AI Model Configuration
AI_PROVIDER = os.getenv("AI_PROVIDER", "groq").lower()  # Default to groq
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Model selection based on provider
AVAILABLE_MODELS = {
    "gemini": {
        "gemini-2.5-flash": "Gemini 2.5 Flash (Google's Latest)",
    },
    "groq": {
        "llama-3.3-70b-versatile": "Llama 3.3 70B (Ultra Fast & High Quality)",
    }
}

def get_ai_model(provider=None, model_name=None):
    """Initialize AI model based on provider and model name"""
    provider = provider or AI_PROVIDER
    
    if provider == "gemini":
        model = model_name or os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        return ChatGoogleGenerativeAI(model=model, google_api_key=GEMINI_API_KEY)
    elif provider == "groq":
        model = model_name or os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        return ChatGroq(model=model, groq_api_key=GROQ_API_KEY, temperature=0.7)
    else:
        raise ValueError(f"Unsupported AI provider: {provider}")

# Default chat instance
chat = get_ai_model()

room_ai_models = {}  # Store AI model instance per room

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
        username = data.get("username", "User")
        
        # Allow user to specify model (optional)
        requested_provider = data.get("provider", AI_PROVIDER)
        requested_model = data.get("model")

        if not user_message or not room_id:
            return Response({"error": "Invalid request"}, status=400)

        # Get or create AI model for this room
        if room_id not in room_ai_models:
            room_ai_models[room_id] = get_ai_model(requested_provider, requested_model)

        ai_model = room_ai_models[room_id]

        # Get recent chat history from MongoDB
        room_chat_history = list(
            messages_collection.find({"room_id": room_id}, {"_id": 0}).sort("timestamp")
        )[-10:]  # Last 10 messages for context

        # Build context from chat history
        context = ""
        system_prompt = os.getenv(
            "Prompt",
            "You are ConvoRoom's friendly AI assistant. Provide clear, concise, and helpful responses.",
        )
        
        if room_chat_history:
            context = "Previous conversation:\n"
            for msg in room_chat_history:
                context += f"{msg['sender']}: {msg['message']}\n"
            context += f"\n{username}: {user_message}"
        else:
            context = f"{username}: {user_message}"

        # Generate AI response with context
        full_prompt = f"{system_prompt}\n\n{context}\n\nAI:"
        ai_response = ai_model.invoke(full_prompt).content

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
                "provider": requested_provider,
            }
        )

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"room_{room_id}",
            {
                "type": "chat_message",
                "message": ai_response,
                "username": "AI",
                "provider": requested_provider,
            },
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


@api_view(["GET"])
def get_available_models(request):
    """Return list of available AI models"""
    return Response({
        "current_provider": AI_PROVIDER,
        "providers": {
            "gemini": {
                "name": "Google Gemini",
                "enabled": bool(GEMINI_API_KEY),
                "models": AVAILABLE_MODELS["gemini"]
            },
            "groq": {
                "name": "Groq (Ultra Fast)",
                "enabled": bool(GROQ_API_KEY),
                "models": AVAILABLE_MODELS["groq"]
            }
        }
    })


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

        # Initialize AI model if needed (will be created on first message)
        if room_id not in room_ai_models:
            room_ai_models[room_id] = get_ai_model()
    except Exception as e:
        # TODO: Use proper logging instead of print
        import logging

        logging.error(f"Error in background initialization: {e}")


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
