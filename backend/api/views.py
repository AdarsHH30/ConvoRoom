from django.shortcuts import render
import random as Random


from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def hello_world(request):
    return Response({"message": "Hello from Django!"})


@api_view(["GET"])
def generateRoomId(request):
    roomId = Random.randint(1000, 9999)
    return Response({"roomId": roomId})


from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

print(API_KEY)


@api_view(["POST"])
def getReactData(request):
    # conversation = langChainSetup()
    chat = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=API_KEY)
    # to store chats
    memory = ConversationBufferMemory(return_messages=True)

    # # helps to connect chat with memory
    # data = request.data
    # if not data:
    #     data = "Who are you"
    #     return Response({"error": "No data provided"}, status=400)
    data = request.data

    conversation = ConversationChain(llm=chat, memory=memory, verbose=False)

    response = conversation.predict(input=data)

    print(response)
    # returnAIresponse(data)
    return Response({"message": "Data received"})


def langChainSetup():
    # create a chat model
    chat = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=API_KEY)
    # to store chats
    memory = ConversationBufferMemory(return_messages=True)

    # helps to connect chat with memory
    conversation = ConversationChain(llm=chat, memory=memory, verbose=False)
    return conversation


@api_view(["GET"])
def returnAIresponse(request, userInput):
    response = f"Received input: {userInput}"
    return Response({"message": response})
