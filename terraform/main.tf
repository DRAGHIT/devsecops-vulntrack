# ==============================================================================
# VulnTrack Infrastructure as Code (Terraform)
# Target: Local Kubernetes (kind / Minikube / Docker Desktop / MicroK8s)
# Purpose: Provision Cluster Baseline (Namespace, Quotas, Limits, ServiceAccount)
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30.0"
    }
  }
}

provider "kubernetes" {
  config_path = var.kubeconfig_path
}

# 1. Dedicated Application Namespace
resource "kubernetes_namespace" "vulntrack" {
  metadata {
    name = var.namespace_name
    labels = {
      "app.kubernetes.io/name"       = "vulntrack"
      "app.kubernetes.io/part-of"    = "vulntrack"
      "app.kubernetes.io/managed-by" = "terraform"
    }
  }
}

# 2. Namespace Resource Quota (Protects cluster from noisy-neighbor starvation)
resource "kubernetes_resource_quota" "vulntrack_quota" {
  metadata {
    name      = "vulntrack-resource-quota"
    namespace = kubernetes_namespace.vulntrack.metadata[0].name
  }

  spec {
    hard = {
      "requests.cpu"    = "2000m"
      "requests.memory" = "2Gi"
      "limits.cpu"      = "4000m"
      "limits.memory"   = "4Gi"
      "pods"            = "15"
    }
  }
}

# 3. Limit Range (Enforces default container limits when omitted in manifests)
resource "kubernetes_limit_range" "vulntrack_limits" {
  metadata {
    name      = "vulntrack-default-limits"
    namespace = kubernetes_namespace.vulntrack.metadata[0].name
  }

  spec {
    limit {
      type = "Container"
      default = {
        cpu    = "500m"
        memory = "512Mi"
      }
      default_request = {
        cpu    = "100m"
        memory = "128Mi"
      }
    }
  }
}

# 4. Dedicated Service Account with Least Privilege
resource "kubernetes_service_account" "vulntrack_sa" {
  metadata {
    name      = "vulntrack-workload-sa"
    namespace = kubernetes_namespace.vulntrack.metadata[0].name
    labels = {
      "app.kubernetes.io/name"       = "vulntrack"
      "app.kubernetes.io/managed-by" = "terraform"
    }
  }
}
