# ==============================================================================
# Outputs — consumed by the Helm/Kubectl steps in the deployment guide
# ==============================================================================

output "cluster_name" {
  description = "Name to pass to aws eks update-kubeconfig."
  value       = aws_eks_cluster.vulntrack.name
}

output "cluster_endpoint" {
  description = "Public API server endpoint of the EKS control plane."
  value       = aws_eks_cluster.vulntrack.endpoint
}

output "cluster_certificate_authority" {
  description = "Base64-encoded TLS certificate for the API server."
  value       = aws_eks_cluster.vulntrack.certificate_authority[0].data
}

output "node_group_name" {
  description = "Managed worker node group name."
  value       = aws_eks_node_group.general.node_group_name
}

output "node_group_status" {
  description = "Lifecycle state of the worker node group."
  value       = aws_eks_node_group.general.status
}

output "worker_instance_type" {
  description = "EC2 instance type backing each worker node."
  value       = var.node_instance_type
}

output "public_subnets" {
  description = "Public subnet IDs provisioned for the cluster."
  value       = [for s in aws_subnet.public : "${s.availability_zone} -> ${s.cidr_block}"]
}

output "vpc_id" {
  description = "VPC hosting the cluster."
  value       = aws_vpc.vulntrack.id
}

output "next_steps" {
  description = "Commands to run once terraform apply finishes."
  value = join("\n", [
    "1. aws eks --region ${var.aws_region} update-kubeconfig --name ${aws_eks_cluster.vulntrack.name}",
    "2. kubectl config current-context",
    "3. kubectl apply -f k8s/namespace.yaml",
    "4. helm upgrade --install vulntrack helm/vulntrack --namespace vulntrack --set backend.image.tag=<commit-sha>",
    "5. terraform destroy  (run this before your presentation ends - the cluster bills per hour)"
  ])
}
