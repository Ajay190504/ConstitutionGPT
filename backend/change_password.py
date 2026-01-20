from database import users_collection
import bcrypt
import sys

def change_password(username, new_password):
    # Find user
    user = users_collection.find_one({"username": username})
    if not user:
        print(f"User '{username}' not found.")
        return

    # Hash new password
    password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    
    # Update in database
    users_collection.update_one(
        {"username": username},
        {"$set": {"password_hash": password_hash}}
    )
    
    print(f"Password for user '{username}' updated successfully.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python change_password.py <username> <new_password>")
        # Defaulting to admin if no args provided for convenience
        u = "admin"
        p = "admin123_new" 
        print(f"No arguments provided. Example: changing '{u}' to '{p}'")
        change_password(u, p)
    else:
        change_password(sys.argv[1], sys.argv[2])
