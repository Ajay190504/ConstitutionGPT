from database import users_collection, User
import bcrypt
from datetime import datetime

def create_admin():
    username = "admin"
    email = "admin@constitutiongpt.com"
    password = "admin123"
    
    # Check if admin already exists
    if users_collection.find_one({"username": username}):
        print("Admin user already exists.")
        return

    # Create admin user
    # Using the constructor which hashes the password
    admin_user = User(username, email, password, role="admin")
    
    admin_data = {
        "username": admin_user.username,
        "email": admin_user.email,
        "password_hash": admin_user.password_hash,
        "role": admin_user.role,
        "is_verified": admin_user.is_verified,
        "created_at": admin_user.created_at,
        "is_active": admin_user.is_active
    }
    
    users_collection.insert_one(admin_data)
    print(f"Admin user created successfully!")
    print(f"Username: {username}")
    print(f"Password: {password}")

if __name__ == "__main__":
    create_admin()
