output "namespace" {
  description = "The provisioned Kubernetes namespace"
  value       = kubernetes_namespace.vulntrack.metadata[0].name
}

output "service_account" {
  description = "The provisioned workload service account"
  value       = kubernetes_service_account.vulntrack_sa.metadata[0].name
}

output "resource_quota" {
  description = "The applied resource quota name"
  value       = kubernetes_resource_quota.vulntrack_quota.metadata[0].name
}
