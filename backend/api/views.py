from django.shortcuts import render
import random
import os
from dotenv import load_dotenv
from rest_framework.decorators import api_view
from rest_framework.response import Response
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
import uuid
from dataBase import *
from django.http import JsonResponse
from .models import ChatRoom

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

# Initialize langchain
chat = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=API_KEY)
memory = ConversationBufferMemory(return_messages=True)
conversation = ConversationChain(llm=chat, memory=memory, verbose=True)


@api_view(["POST"])
def getReactData(request):
    data = request.data
    response = conversation.predict(input=data)
    return Response({"Response": response})


@api_view(["GET"])
def hello_world(request):
    return Response({"message": "Hello from Django!"})


rooms = {}

# for models
# @api_view(["GET"])
# def create_room(request):
#     room_name = "New Room"

#     room = ChatRoom.objects.create(name=room_name, created_by=request.user)

#     room_id = room.id
#     print(room_id)
#     return Response({"roomId": room_id})


@api_view(["POST"])
def create_room(request):
    room_id = str(uuid.uuid4())[:6]
    rooms[room_id] = {"participants": 0, "max_participants": 4}
    return Response({"roomId": room_id})


@api_view(["POST"])
def join_room(request):
    room_id = request.data.get("roomId")

    print(room_id)
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
