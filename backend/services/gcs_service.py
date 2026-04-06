import os
import time
import json
from google.cloud import storage
from google.oauth2 import service_account

# Ensure we use an explicit environment variable if set to a JSON string or path
# If GCS_BUCKET_NAME is not set, use a fallback (e.g. for testing)
DEFAULT_BUCKET_NAME = "constitution-gpt-uploads"

class GCSService:

    @staticmethod
    def get_bucket_name():
        return os.getenv("GCS_BUCKET_NAME", DEFAULT_BUCKET_NAME)

    @staticmethod
    def upload_file(file_content: bytes, filename: str, content_type: str = None) -> str:
        """
        Uploads a file to Google Cloud Storage and returns the public URL.
        """
        bucket_name = GCSService.get_bucket_name()
        
        try:
            # Check if GCP_CREDENTIALS_JSON is set (preferred for Render env vars)
            credentials_json = os.getenv("GCP_CREDENTIALS_JSON")
            
            if credentials_json:
                info = json.loads(credentials_json)
                credentials = service_account.Credentials.from_service_account_info(info)
                client = storage.Client(credentials=credentials, project=info.get("project_id"))
            else:
                # Default: uses GOOGLE_APPLICATION_CREDENTIALS path
                client = storage.Client()
                
            bucket = client.bucket(bucket_name)

            # Generate unique filename to avoid overwrites
            unique_filename = f"{int(time.time())}_{filename}"
            blob = bucket.blob(unique_filename)

            # Upload from memory
            blob.upload_from_string(file_content, content_type=content_type)
            
            # Since the bucket might not have fine-grained ACLs or public-read by default,
            # this makes the specific blob public if possible, or we just construct the URL.
            # Assuming uniform bucket-level access is configured to allUsers -> Storage Object Viewer
            public_url = f"https://storage.googleapis.com/{bucket_name}/{unique_filename}"
            return public_url

        except Exception as e:
            import traceback
            print("\n" + "="*50)
            print("GCS UPLOAD ERROR DIAGNOSTIC:")
            traceback.print_exc()
            print("="*50 + "\n")
            raise e
