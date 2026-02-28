# 🐳 Docker Hub Deployment Guide

Follow these steps to push ConstitutionGPT V2.0 to Docker Hub so your friend can pull and run it easily.

---

## 🔝 1. Prepare Docker Hub
1.  Create a free account at [hub.docker.com](https://hub.docker.com/).
2.  Create two repositories:
    - `constitution-gpt-backend`
    - `constitution-gpt-frontend`
3.  Log in via your terminal:
    ```bash
    docker login
    ```

---

## 🏗️ 2. Tag & Push Images

### Backend
1.  Tag the backend image:
    ```bash
    docker tag constitution-gpt-backend ajay190504/constitution-gpt-backend:v2.0
    ```
2.  Push it:
    ```bash
    docker push ajay190504/constitution-gpt-backend:v2.0
    ```

### Frontend
1.  Tag the frontend image:
    ```bash
    docker tag constitution-gpt-frontend ajay190504/constitution-gpt-frontend:v2.0
    ```
2.  Push it:
    ```bash
    docker push ajay190504/constitution-gpt-frontend:v2.0
    ```

---

## 🤝 3. How your Friend Accesses It

Your friend only needs **two files** from you:
1.  `docker-compose-friend.yml` (Pre-configured to pull your images)
2.  `.env` (Your configuration file)

### Friend's `docker-compose.yml`:
```yaml
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always

  backend:
    image: ajay190504/constitution-gpt-backend:v2.0
    ports:
      - "8000:8000"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/
    env_file:
      - .env
    volumes:
      - ./uploads:/app/uploads
      - ./chroma_db:/app/chroma_db
    depends_on:
      mongodb:
        condition: service_healthy
    restart: always

  frontend:
    image: ajay190504/constitution-gpt-frontend:v2.0
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always

volumes:
  mongo_data:
```

### Friend's Launch Command:
```bash
docker-compose up -d
```
The images will automatically download from your Docker Hub! 🚀
