# Chapter 17: End-to-End Setup & Deployment Guide

This guide provides step-by-step instructions for running VulnTrack across two distinct operational modes:
1. **Developer Mode**: Fast local execution using standalone Node/Java or Docker Compose.
2. **Cloud-Native Mode**: Local Kubernetes cluster using kind / Minikube, Terraform, Helm, and NGINX Ingress.

---

## Mode 1: Fast Local Developer Spinup (No Kubernetes Required)

### Option A: Using Docker Compose (Recommended for Local Testing)

1. **Clone the repository and copy environment file**:
   ```powershell
   cp .env.example .env
   ```
2. **Launch all three containers (Postgres, Backend, Frontend)**:
   ```powershell
   cd docker
   docker compose up --build
   ```
3. **Access the application**:
   - Web UI: `http://localhost:3000`
   - Backend REST API: `http://localhost:8080/api/assets`
   - Actuator Health Probes: `http://localhost:8080/actuator/health`

---

### Option B: Running Standalone with In-Memory H2

If Docker is not running on your local laptop, you can run the backend and frontend directly:

1. **Start Spring Boot Backend** (uses in-memory H2 with seed data):
   ```powershell
   cd backend
   .\mvnw.cmd spring-boot:run
   ```
2. **Start React Frontend**:
   ```powershell
   cd frontend
   npm run dev
   ```
3. **Access**:
   - Open browser at `http://localhost:5173`
   - Log in / test using credentials:
     - `ADMIN`: `admin` / `AdminSecurePassword!2026`
     - `VIEWER`: `viewer` / `ViewerReadOnlyPassword!2026`

---

## Mode 2: Cloud-Native Kubernetes Deployment (Kind / Minikube)

### Step 1: Create a Local Kubernetes Cluster
If using **kind**:
```powershell
kind create cluster --name vulntrack-cluster
```
If using **Minikube**:
```powershell
minikube start --cpus=4 --memory=4096 --addons=ingress,metrics-server
```

### Step 2: Provision Infrastructure Baseline via Terraform
```powershell
cd terraform
terraform init
terraform apply -auto-approve
```
This provisions:
- Dedicated namespace `vulntrack`
- Resource quota and limit ranges
- Service account `vulntrack-workload-sa`

### Step 3: Deploy Application Workloads via Helm
```powershell
cd ../helm
helm install vulntrack ./vulntrack -n vulntrack
```

### Step 4: Verify Running Pods and Services
```powershell
kubectl get pods,svc,hpa,ingress -n vulntrack
```
Expected output:
```text
NAME                                     READY   STATUS    RESTARTS   AGE
vulntrack-backend-698f79f4c8-4m2p1       1/1     Running   0          45s
vulntrack-backend-698f79f4c8-9k1x2       1/1     Running   0          45s
vulntrack-frontend-77f8bc5b4d-h8z9q      1/1     Running   0          45s
vulntrack-postgres-545f949c98-j2d3x      1/1     Running   0          45s

NAME                     TYPE        CLUSTER-IP       PORT(S)
vulntrack-backend        ClusterIP   10.96.142.10     8080/TCP
vulntrack-frontend       ClusterIP   10.96.201.55     80/TCP
vulntrack-postgres       ClusterIP   10.96.18.99      5432/TCP

NAME                     REFERENCE                      TARGETS         MINPODS   MAXPODS   REPLICAS
vulntrack-backend-hpa    Deployment/vulntrack-backend   cpu: 12% / 70%   2         5         2
```

### Step 5: Access the Cluster
To access the web application in a local development cluster:
```powershell
kubectl port-forward svc/vulntrack-frontend 3000:80 -n vulntrack
kubectl port-forward svc/vulntrack-backend 8080:8080 -n vulntrack
```
- Open `http://localhost:3000` in your web browser for the React frontend UI.
- Open `http://localhost:8080/swagger-ui/index.html` for interactive OpenAPI/Swagger testing.

---

## Mode 3: Interactive Swagger UI & API Verification

Whether running via Docker Compose, standalone Spring Boot, or Kubernetes port-forward, you can test all endpoints directly:

### 1. Interactive Swagger UI
Open your browser to:
```text
http://localhost:8080/swagger-ui/index.html
```
Click **Authorize** (top right) and enter:
- **Admin**: `admin` / `AdminSecurePassword!2026` (can test GET, POST, PUT, DELETE)
- **Viewer**: `viewer` / `ViewerReadOnlyPassword!2026` (can test GET, blocked with 403 on POST/PUT/DELETE)

### 2. Command-Line `curl` Verification

#### Test Read Access with Viewer Credentials (200 OK):
```powershell
curl -u viewer:ViewerReadOnlyPassword!2026 http://localhost:8080/api/dashboard/summary
```

#### Test Write Access with Admin Credentials (201 Created):
```powershell
curl -X POST http://localhost:8080/api/assets `
  -u admin:AdminSecurePassword!2026 `
  -H "Content-Type: application/json" `
  -d '{"name":"Billing API","type":"API","environment":"PRODUCTION","description":"Payment gateway service"}'
```

#### Test RBAC Security Enforcement with Viewer (403 Forbidden):
```powershell
curl -X POST http://localhost:8080/api/assets `
  -u viewer:ViewerReadOnlyPassword!2026 `
  -H "Content-Type: application/json" `
  -d '{"name":"Unauthorized Asset","type":"API","environment":"PRODUCTION"}'
```
*Expected Output*: HTTP 403 Forbidden with `{"status": 403, "message": "Access Denied"}`.

