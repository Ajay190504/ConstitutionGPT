import requests
import json
import time

API_URL = "http://localhost:8000"

def test_login_and_verify():
    print("Testing Login and Verify Token...")
    # 1. Login to get token
    login_data = {
        "username": "admin", # Replace with lawyer username if known, or just check payload structure
        "password": "admin"
    }
    
    try:
        response = requests.post(f"{API_URL}/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            print("Login Success:")
            print("User data in login response:")
            print(json.dumps(data.get("user", {}), indent=2))
            
            token = data.get("access_token")
            
            # 2. Verify token
            headers = {"Authorization": f"Bearer {token}"}
            verify_res = requests.get(f"{API_URL}/verify-token", headers=headers)
            print("\nVerify Token Response:")
            print(json.dumps(verify_res.json(), indent=2))
        else:
            print(f"Login Failed: {response.text}")
    except Exception as e:
         print(f"Error: {e}")

if __name__ == "__main__":
    test_login_and_verify()
