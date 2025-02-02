from django.shortcuts import render
import random as Random

# Create your views here.

from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def hello_world(request):
    return Response({"message": "Hello from Django!"})


@api_view(["GET"])
def generateRoomId(request):
    roomId = Random.randint(1000, 9999)
    return Response({"roomId": roomId})


@api_view(["POST"])
def getReactData(request):
    print("hellow")
    data = request.data
    print(data)
    return Response({"message": "Data received"})
