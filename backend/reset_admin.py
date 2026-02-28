from database import users_collection
import bcrypt
import os
from bson import ObjectId

def reset_admin():
    username = "admin"
    new_password = "admin123"
    
    # Hash the new password
    password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    
    # Update the user
    result = users_collection.update_one(
        {"username": username},
        {"$set": {"password_hash": password_hash, "role": "admin", "is_verified": True}}
    )
    
    if result.matched_count > 0:
        print(f"✅ Successfully reset password for user '{username}' to '{new_password}'")
    else:
        print(f"❌ User '{username}' not found. Creating a new admin...")
        # Fallback to create if doesn't exist
        from database import User
        admin_user = User(username, "admin@constitutiongpt.com", new_password, role="admin")
        admin_data = {
            "username": admin_user.username,
            "email": admin_user.email,
            "password_hash": admin_user.password_hash,
            "role": admin_user.role,
            "is_verified": True,
            "created_at": admin_user.created_at,
            "is_active": True
        }
        users_collection.insert_one(admin_data)
        print(f"✅ New admin user created! Username: {username}, Password: {new_password}")

if __name__ == "__main__":
    reset_admin()
