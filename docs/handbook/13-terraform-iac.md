# Chapter 13: Terraform & Infrastructure as Code (IaC)

Infrastructure as Code (IaC) is the practice of managing cloud and cluster infrastructure using machine-readable configuration files rather than manual interactive console clicks or ad-hoc terminal commands.

---

## 1. Why Use Terraform for Kubernetes?

In many university projects, students manually run commands like:
```bash
kubectl create namespace vulntrack
kubectl apply -f quota.yaml
```
### Problems with manual `kubectl`:
1. **Imperative & Non-Idempotent**: Re-running `kubectl create namespace` throws an error (`Error: namespaces already exists`).
2. **No State Tracking**: `kubectl` doesn't track what resources *should* exist vs what was manually deleted.
3. **No Drift Detection**: If an operator modifies a quota behind the scenes, you have no way to detect or revert the drift.

### The Terraform Solution:
**Terraform** is **declarative**. You define the desired state, and Terraform's engine calculates the diff (`plan`) and reconciles the real-world infrastructure to match your code (`apply`).

---

## 2. Infrastructure vs. Application Separation

A core DevOps architectural principle is **Separation of Concerns between Infrastructure and Workloads**:

| Tool | Responsibility | Managed Resources in VulnTrack |
| :--- | :--- | :--- |
| **Terraform** | Platform / Infrastructure Baseline | `kubernetes_namespace`, `kubernetes_resource_quota`, `kubernetes_limit_range`, `kubernetes_service_account` |
| **Helm** | Application Workload Lifecycle | Deployments, Services, ConfigMaps, Secrets, Ingress, Horizontal Pod Autoscalers (HPA) |

This prevents application deployments from accidentally modifying cluster-wide limits or deleting core namespaces.

---

## 3. Terraform Resource Breakdown

### 1. Resource Quotas (`kubernetes_resource_quota`)
Prevents a runaway pod from exhausting the entire node:
- Hard cap: `requests.cpu: 2000m` (2 CPU cores), `requests.memory: 2Gi`.
- Limit cap: `limits.cpu: 4000m`, `limits.memory: 4Gi`, max 15 pods.

### 2. Limit Ranges (`kubernetes_limit_range`)
Automatically injects default resource requests and limits if a container spec omits them:
- Default Request: 100m CPU, 128Mi RAM.
- Default Limit: 500m CPU, 512Mi RAM.

---

## 4. How to Execute Terraform Step-by-Step

### 1. Initialize Terraform Providers
```powershell
cd terraform
terraform init
```

### 2. Validate Configuration Syntax
```powershell
terraform fmt -check
terraform validate
```

### 3. Generate Execution Plan
```powershell
terraform plan -out=tfplan
```

### 4. Apply Infrastructure
```powershell
terraform apply tfplan
```

### 5. Teardown / Cleanup
```powershell
terraform destroy -auto-approve
```
