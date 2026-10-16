# ==============================================================================
# EKS Cluster + Managed Node Group (Worker Nodes)
# ==============================================================================

resource "aws_eks_cluster" "vulntrack" {
  name     = local.name
  role_arn = aws_iam_role.cluster.arn
  version  = var.kubernetes_version

  vpc_config {
    subnet_ids              = local.public_subnet_ids
    security_group_ids      = [aws_security_group.cluster.id]
    endpoint_private_access = false
    endpoint_public_access  = true
  }

  tags = local.cluster_tags

  depends_on = [
    aws_iam_role_policy_attachment.cluster_policy,
    aws_vpc_security_group_ingress_rule.cluster_from_nodes,
  ]

  # A control plane routinely needs more than Terraform's 20 minute default.
  timeouts {
    create = "40m"
    update = "40m"
    delete = "40m"
  }
}

resource "aws_eks_node_group" "general" {
  cluster_name    = aws_eks_cluster.vulntrack.name
  node_group_name = "${local.name}-workers"
  node_role_arn   = aws_iam_role.nodes.arn
  subnet_ids      = local.public_subnet_ids

  instance_types = [var.node_instance_type]
  capacity_type  = "ON_DEMAND"
  disk_size      = 30

  scaling_config {
    desired_size = var.node_desired_capacity
    min_size     = var.node_min_capacity
    max_size     = var.node_max_capacity
  }

  update_config {
    max_unavailable = 1
  }

  tags = local.cluster_tags

  depends_on = [
    aws_iam_role_policy_attachment.node_worker_policy,
    aws_iam_role_policy_attachment.node_cni_policy,
    aws_iam_role_policy_attachment.node_ecr_policy,
  ]

  timeouts {
    create = "60m"
    update = "60m"
    delete = "60m"
  }
}
