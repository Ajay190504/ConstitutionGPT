import requests

# Payload mimicking a 'user' registration
data = {
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "Password1!",
    "role": "user",
    "phone": "1234567890",
    "address": "123 Street",
    "city": "City",
    "lawyer_id_proof": "",
    "consultation_fee": "0",
    "specialization": "",
    "years_of_experience": "0"
}

res = requests.post("http://localhost:8000/register", data=data)
print("Status Code:", res.status_code)
print("Response:", res.text)
