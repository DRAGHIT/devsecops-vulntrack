# Chapter 18: Troubleshooting Common Failures & Diagnostic Guide

When deploying multi-tier systems across Docker, Kubernetes, and Helm, failures will inevitably occur. A senior DevOps engineer is differentiated by their ability to systematically diagnose and resolve errors.

---

## 1. The 4-Step Diagnostic Methodology

Whenever a service fails, always follow this order:
1. **Check Status**: `kubectl get pods -n vulntrack`
2. **Inspect Events**: `kubectl describe pod <pod-name> -n vulntrack`
3. **Inspect Application Logs**: `kubectl logs <pod-name> -n vulntrack --tail=100`
4. **Test Network Connectivity**: `kubectl exec -it <pod-name> -n vulntrack -- wget -qO- http://vulntrack-backend:8080/actuator/health`

---

## 2. Common Failures & Step-by-Step Resolutions

### Problem 1: Pod stuck in `CrashLoopBackOff`

**Symptoms**: Pod status repeatedly alternates between `Error`, `CrashLoopBackOff`, and restarting.
**Root Cause**: The Spring Boot process started, threw a fatal exception, and exited with status 1. Most commonly:
- Database is unreachable (`Connection refused` on port 5432).
- Incorrect database credentials in secret.
- Flyway SQL migration script failed syntax validation.

**Diagnostic Command**:
```powershell
kubectl logs -l app.kubernetes.io/component=backend -n vulntrack --previous
```

**Resolution**:
1. Check if the PostgreSQL pod is `1/1 Running`:
   ```powershell
   kubectl get pods -l app.kubernetes.io/component=postgres -n vulntrack
   ```
2. Verify credentials in `vulntrack-secrets`:
   ```powershell
   kubectl get secret vulntrack-secrets -n vulntrack -o jsonpath="{.data.postgres-password}" | [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_))
   ```

---

### Problem 2: Pod stuck in `ImagePullBackOff` / `ErrImagePull`

**Symptoms**: Kubernetes cannot fetch the container image.
**Root Causes**:
1. Image tag does not exist in GHCR.
2. The GHCR repository is private, and the Kubernetes namespace lacks an `imagePullSecret`.

**Diagnostic Command**:
```powershell
kubectl describe pod <pod-name> -n vulntrack | Select-String "Failed to pull image"
```

**Resolution**:
If testing locally with Kind or Minikube, load local Docker images directly into the cluster:
```powershell
# For Kind:
kind load docker-image vulntrack-backend:local --name vulntrack-cluster

# For Minikube:
minikube image load vulntrack-backend:local
```
Then ensure `imagePullPolicy: IfNotPresent` is set in `values.yaml`.

---

### Problem 3: HPA shows `TARGETS: <unknown> / 70%`

**Symptoms**: The Horizontal Pod Autoscaler does not scale up under heavy load, and `kubectl get hpa` displays `<unknown>`.

**Root Causes**:
1. The cluster does not have `metrics-server` installed.
2. The container specification is missing `resources.requests.cpu`.

**Resolution**:
1. Confirm metrics-server is running:
   ```powershell
   kubectl get pods -n kube-system | Select-String "metrics-server"
   ```
2. In local clusters, metrics-server requires the `--kubelet-insecure-tls` flag because local node certificates are self-signed:
   ```powershell
   kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
   kubectl patch deployment metrics-server -n kube-system --type 'json' -p '[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
   ```

---

### Problem 4: Browser displays `CORS policy: No 'Access-Control-Allow-Origin' header`

**Symptoms**: The React frontend fails to fetch data, and browser console displays red CORS errors.

**Root Cause**: The browser sent a cross-origin request from `http://localhost:5173` to `http://localhost:8080`, but the origin was missing from `SecurityConfig.java`.

**Resolution**:
Verify `app.cors.allowed-origins` in `application.yml` includes the frontend origin:
```yaml
app:
  cors:
    allowed-origins: "http://localhost:5173,http://localhost:3000,http://localhost:80"
```
Or route all API calls through the Vite development proxy (`/api` → `localhost:8080`), making requests appear same-origin to the browser!
