variable "kubeconfig_path" {
  type        = string
  description = "Path to the local kubeconfig file"
  default     = "~/.kube/config"
}

variable "namespace_name" {
  type        = string
  description = "Kubernetes namespace to manage for VulnTrack"
  default     = "vulntrack"
}
