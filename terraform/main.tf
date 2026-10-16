# ==============================================================================
# VulnTrack Infrastructure as Code (Terraform) — AWS Provider Baseline
# Target: AWS VPC + EKS Cluster + Managed Node Group
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }

  # State lives in the developer's local terraform.tfstate by default.
  # For a team, move it to S3 + locking:
  #
  # backend "s3" {
  #   bucket = "my-terraform-state"
  #   key    = "vulntrack/terraform.tfstate"
  #   region = "eu-west-1"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project       = var.project_name
      ManagedBy     = "terraform"
      Environment   = var.environment
      "cost-center" = "student-capstone"
    }
  }
}

# Two real availability zones, whichever region the student selects.
data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  name              = "${var.project_name}-${var.environment}"
  public_subnet_ids = aws_subnet.public[*].id

  # EKS needs these tags on the subnets it schedules pods into, otherwise the
  # ELB created for type=LoadBalancer services cannot discover the subnets.
  subnet_tags = {
    "kubernetes.io/role/elb"              = "1"
    "kubernetes.io/cluster/${local.name}" = "shared"
  }

  cluster_tags = {
    "kubernetes.io/cluster/${local.name}" = "owned"
  }
}
