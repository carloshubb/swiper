# ☁️ AWS Deployment Guide (Project Specific)

This guide is tailored for the **MLOps Auto Training API** project. It covers deploying the **FastAPI Backend on EC2** and the **Angular Frontend on S3/CloudFront**.

---

## 🏗️ Architecture Overview

- **Backend**: FastAPI (Python) → Deployed on **AWS EC2** (using Docker or Manual).
- **Frontend**: Angular → Deployed on **AWS S3** + **CloudFront**.
- **Database**: **MongoDB Atlas** (Recommended) or SQLite (Local on EC2).
- **MLflow**: Statistics tracked locally or on S3 (if configured).

---

## 🛠️ Step 1: Backend Deployment (EC2)

We recommend using **Docker** for the backend as `Dockerfile.prod` is already set up.

### 1. Launch EC2 Instance
1. **Name**: `mlops-backend`
2. **OS**: **Ubuntu 22.04 LTS** (or 20.04).
3. **Instance Type**: **t3.medium** (Recommended for ML training) or `t2.micro` (Free tier, might be slow for training).
4. **Security Group Inbound Rules**:
   - `SSH` (22) - My IP
   - `HTTP` (80) - Anywhere
   - `HTTPS` (443) - Anywhere
   - `Custom TCP` (8000) - Anywhere (for API testing)

### 2. Connect to Instance
```bash
ssh -i "your-key.pem" ubuntu@<YOUR-EC2-PUBLIC-IP>
```

### 3. Install Docker & Git
```bash
# Update and install Docker
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io git unzip
sudo usermod -aG docker $USER
# Log out and log back in for group changes to take effect
exit
```
*Reconnect via SSH.*

### 4. Clone & Configure Backend
```bash
# Clone the repository (Assuming you are deploying the backend repo)
git clone https://github.com/Flower-City-Online/auto-training-api.git
cd auto-training-api/backend

# Create environment file
cp .env.example .env
nano .env
# Edit .env with your MongoDB URL and other secrets if needed
```

### 5. Deploy with Docker (Recommended)
This uses the standard `Dockerfile.prod` included in your project.

```bash
# Build the production image
docker build -f Dockerfile.prod -t mlops-backend .

# Run the container (Mapping port 8000)
docker run -d \
  --name api \
  -p 8000:8000 \
  --restart always \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/models:/app/models \
  -v $(pwd)/mlruns:/app/mlruns \
  mlops-backend
```

**✅ Backend is now live at:** `http://<YOUR-EC2-IP>:8000`

---

## 🎨 Step 2: Frontend Deployment (S3 + CloudFront)

*Note: Perform these steps in your local Frontend directory.*

### 1. Build Angular App
In your local `frontend/` folder:
```powershell
# Update API URL to your EC2 IP first!
# Edit: src/environments/environment.prod.ts
# apiUrl: 'http://<YOUR-EC2-IP>:8000'

npm install
npm run build --prod
```
This creates a `dist/` folder.

### 2. Create S3 Bucket (Static Hosting)
1. Go to **AWS S3** -> **Create Bucket**.
2. Name: `mlops-frontend-app` (must be unique).
3. **Uncheck** "Block all public access" (Acknowledge warning).
4. Create.
5. Go to **Properties** -> **Static website hosting** -> **Enable**.
6. Set Index document: `index.html`.

### 3. Upload Files
Upload all files **inside** `dist/rating-swiper/` (or `dist/frontend/`) to the S3 bucket root.

### 4. CloudFront (Optional but Recommended for HTTPS)
1. Create **CloudFront Distribution**.
2. Origin domain: Select your S3 bucket.
3. Viewer Protocol Policy: **Redirect HTTP to HTTPS**.
4. Create.
5. Use the **CloudFront Domain Name** to access your app.

---

## 🔌 Step 3: Connect Frontend & Backend

1. **CORS on Backend**:
   If using CloudFront, update `backend/app/main.py` on EC2:
   ```python
   allow_origins=["http://<YOUR-S3-BUCKET-URL>", "https://<YOUR-CLOUDFRONT-URL>"]
   ```
   *Then restart Docker container:* `docker restart api`

2. **API URL on Frontend**:
   Ensure `environment.prod.ts` points to the EC2 HTTP address (or HTTPS if you configured a domain + SSL).

---

## 🧹 Maintenance

**View Logs:**
```bash
docker logs -f api
```

**Update Backend Code:**
```bash
cd auto-training-api/backend
git pull
docker build -f Dockerfile.prod -t mlops-backend .
docker stop api
docker rm api
# Run the 'docker run' command from step 5 again
```
