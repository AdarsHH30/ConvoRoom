from django.shortcuts import render
import random
import os
from dotenv import load_dotenv
from rest_framework.decorators import api_view
from rest_framework.response import Response
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain


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


@api_view(["GET"])
def generateRoomId(request):
    room_id = random.randint(1000, 9999)
    return Response({"roomId": room_id})
