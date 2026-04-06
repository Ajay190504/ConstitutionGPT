from dotenv import load_dotenv
load_dotenv()
from services.email_service import send_reset_email
try:
    res = send_reset_email('ajaywaghmare190504@gmail.com', 'http://localhost:5173/reset-test')
    print("Email sent result:", res)
except Exception as e:
    print("Error:", e)
