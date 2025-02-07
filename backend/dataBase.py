# from pymongo import MongoClient

# # Connect to MongoDB server
# client = MongoClient("mongodb://localhost:27017/")

# db = client["convoroom"]

# # Insert data to ensure the database is created
# db.mycollection.insert_one({"name": "Sample Data", "info": "Created from Django"})
# print("Database and collection created!")

from pymongo import MongoClient
from django.conf import settings

# Connection URI
MONGO_URI = "mongodb://localhost:27017/"
DATABASE_NAME = "convoroom"

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
