import pytest
from services.auth_service import AuthService
from services.rag_service import RAGService
from bson import ObjectId

def test_auth_service_token_creation():
    user_data = {
        "_id": ObjectId(),
        "username": "testuser",
        "role": "user"
    }
    token = AuthService.create_access_token(user_data)
    assert token is not None
    
    payload = AuthService.verify_token(token)
    assert payload["username"] == "testuser"
    assert payload["role"] == "user"

def test_rag_service_query():
    # Note: This requires the vector DB to be initialized or seeded
    # We can mock it or just verify it returns a list
    results = RAGService.query("What are fundamental rights?")
    assert isinstance(results, list)

# More tests will be added as we progress
