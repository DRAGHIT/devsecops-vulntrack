# ==============================================================================
# Input Variables
# Copy terraform.tfvars.example to terraform.tfvars and adjust before terraform apply
# ==============================================================================

variable "aws_region" {
  description = "AWS region that hosts the VPC and EKS control plane."
  type        = string
  default     = "eu-west-1"
}

variable "project_name" {
  description = "Name prefix used for every AWS resource tag and resource name."
  type        = string
  default     = "vulntrack"
}

variable "environment" {
  description = "Deployment stage, used to keep student clusters apart."
  type        = string
  default     = "capstone"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Exactly two public subnet CIDR blocks, one per availability zone."
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]

  validation {
    condition     = length(var.public_subnet_cidrs) >= 2
    error_message = "EKS requires at least two public subnets in different AZs."
  }
}

variable "kubernetes_version" {
  description = "EKS Kubernetes version. Leave null to let AWS choose its current default."
  type        = string
  default     = null
}

variable "node_instance_type" {
  description = "EC2 instance type for the managed node group workers."
  type        = string
  default     = "t3.medium"
}

variable "node_desired_capacity" {
  description = "Number of worker nodes launched with the node group."
  type        = number
  default     = 2
}

variable "node_min_capacity" {
  description = "Minimum worker nodes kept by the autoscaling group."
  type        = number
  default     = 1
}

variable "node_max_capacity" {
  description = "Maximum worker nodes the autoscaling group may scale out to."
  type        = number
  default     = 3
}

variable "kubectl_access_cidr" {
  description = "CIDR allowed to reach the EKS API server on port 443. Change to your own /32 for a real account."
  type        = string
  default     = "0.0.0.0/0"
}
