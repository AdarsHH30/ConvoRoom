"""
Production-ready test cases for ConvoRoom API
Run with: python manage.py test api.test_api
"""
from django.test import TestCase, Client
from django.urls import reverse
from unittest.mock import patch, MagicMock
import json


class HealthCheckTests(TestCase):
    """Test basic API health and connectivity"""

    def setUp(self):
        self.client = Client()

    def test_models_endpoint_accessible(self):
        """Test that the models endpoint is accessible (health check)"""
        response = self.client.get("/api/models/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("providers", data)

    def test_get_available_models(self):
        """Test that available models endpoint returns provider info"""
        response = self.client.get("/api/models/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("providers", data)
        self.assertIn("gemini", data["providers"])
        self.assertIn("groq", data["providers"])


class RoomManagementTests(TestCase):
    """Test room creation and joining"""

    def setUp(self):
        self.client = Client()

    @patch("api.views.db")
    def test_create_room_success(self, mock_db):
        """Test successful room creation"""
        mock_db.__getitem__.return_value.insert_one = MagicMock()
        
        response = self.client.post(
            "/api/create_room/",
            data=json.dumps({"roomId": "test123", "room_name": "Test Room"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("success"))
        self.assertEqual(data.get("roomId"), "test123")

    def test_create_room_generates_id(self):
        """Test that room creation generates an ID if none provided"""
        with patch("api.views.db") as mock_db:
            mock_db.__getitem__.return_value.insert_one = MagicMock()
            
            response = self.client.post(
                "/api/create_room/",
                data=json.dumps({}),
                content_type="application/json",
            )
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertTrue(data.get("success"))
            self.assertIsNotNone(data.get("roomId"))


class ChatAPITests(TestCase):
    """Test chat message sending"""

    def setUp(self):
        self.client = Client()

    def test_send_message_missing_fields(self):
        """Test that missing required fields return error"""
        response = self.client.post(
            "/api/data/",
            data=json.dumps({"message": ""}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_send_message_missing_room_id(self):
        """Test that missing room ID returns error"""
        response = self.client.post(
            "/api/data/",
            data=json.dumps({"message": "Hello", "username": "testuser"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_send_message_missing_message(self):
        """Test that missing message content returns error"""
        response = self.client.post(
            "/api/data/",
            data=json.dumps({"roomId": "testroom", "username": "testuser"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)


class ChatHistoryTests(TestCase):
    """Test chat history retrieval"""

    def setUp(self):
        self.client = Client()

    @patch("api.views.messages_collection")
    def test_get_chat_history_success(self, mock_collection):
        """Test successful chat history retrieval"""
        mock_collection.find.return_value.sort.return_value = [
            {"sender": "user1", "message": "Hello", "timestamp": "2026-01-02T10:00:00"},
            {"sender": "AI", "message": "Hi there!", "timestamp": "2026-01-02T10:00:01"},
        ]

        response = self.client.get("/api/get_chat_history/testroom/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("messages", data)
        self.assertEqual(len(data["messages"]), 2)

    @patch("api.views.messages_collection")
    def test_get_chat_history_empty_room(self, mock_collection):
        """Test chat history for room with no messages"""
        mock_collection.find.return_value.sort.return_value = []

        response = self.client.get("/api/get_chat_history/emptyroom/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["messages"], [])


class InputValidationTests(TestCase):
    """Test input validation and sanitization"""

    def setUp(self):
        self.client = Client()

    def test_empty_message_rejected(self):
        """Test that empty messages are rejected"""
        response = self.client.post(
            "/api/data/",
            data=json.dumps({
                "message": "   ",
                "roomId": "testroom",
                "username": "testuser",
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_whitespace_only_room_id_rejected(self):
        """Test that whitespace-only room IDs are rejected"""
        response = self.client.post(
            "/api/data/",
            data=json.dumps({
                "message": "Hello",
                "roomId": "   ",
                "username": "testuser",
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)


class AIProviderTests(TestCase):
    """Test AI provider selection"""

    def setUp(self):
        self.client = Client()

    def test_available_models_structure(self):
        """Test that models endpoint returns correct structure"""
        response = self.client.get("/api/models/")
        data = response.json()
        
        # Check structure
        self.assertIn("current_provider", data)
        self.assertIn("providers", data)
        
        # Check each provider has required fields
        for provider_key, provider_data in data["providers"].items():
            self.assertIn("name", provider_data)
            self.assertIn("enabled", provider_data)
            self.assertIn("models", provider_data)
