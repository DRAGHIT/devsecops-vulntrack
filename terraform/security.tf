# ==============================================================================
# Security Groups for the EKS Control Plane and the Worker Nodes
# ==============================================================================

resource "aws_security_group" "cluster" {
  name        = "${local.name}-eks-cluster"
  description = "VulnTrack: EKS control plane security group"
  vpc_id      = aws_vpc.vulntrack.id

  tags = merge(
    local.cluster_tags,
    { Name = "${local.name}-eks-cluster" }
  )
}

# Worker nodes must reach the API server on 443.
resource "aws_vpc_security_group_ingress_rule" "cluster_from_nodes" {
  security_group_id            = aws_security_group.cluster.id
  referenced_security_group_id = aws_security_group.nodes.id
  ip_protocol                  = "-1"
}

# kubectl (this machine) reaching the public API endpoint.
resource "aws_vpc_security_group_ingress_rule" "cluster_from_admin" {
  security_group_id = aws_security_group.cluster.id
  cidr_ipv4         = var.kubectl_access_cidr
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
}

resource "aws_vpc_security_group_egress_rule" "cluster_all" {
  security_group_id = aws_security_group.cluster.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

resource "aws_security_group" "nodes" {
  name        = "${local.name}-eks-nodes"
  description = "VulnTrack: EKS worker node security group"
  vpc_id      = aws_vpc.vulntrack.id

  tags = merge(
    local.cluster_tags,
    { Name = "${local.name}-eks-nodes" }
  )
}

# The control plane pushes pod specs down to the kubelets.
resource "aws_vpc_security_group_ingress_rule" "nodes_from_cluster" {
  security_group_id            = aws_security_group.nodes.id
  referenced_security_group_id = aws_security_group.cluster.id
  ip_protocol                  = "-1"
}

# Pod-to-pod traffic inside the node group.
resource "aws_vpc_security_group_ingress_rule" "nodes_self" {
  security_group_id            = aws_security_group.nodes.id
  referenced_security_group_id = aws_security_group.nodes.id
  ip_protocol                  = "-1"
}

resource "aws_vpc_security_group_egress_rule" "nodes_all" {
  security_group_id = aws_security_group.nodes.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}
