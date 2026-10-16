# ==============================================================================
# Network Layer: VPC, Internet Gateway, Route Table, Two Public Subnets
# ==============================================================================

resource "aws_vpc" "vulntrack" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${local.name}-vpc"
  }
}

resource "aws_internet_gateway" "vulntrack" {
  vpc_id = aws_vpc.vulntrack.id

  tags = {
    Name = "${local.name}-igw"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.vulntrack.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.vulntrack.id
  }

  tags = {
    Name = "${local.name}-public-rt"
  }
}

# One public subnet per availability zone (minimum two for EKS high availability).
resource "aws_subnet" "public" {
  count = length(var.public_subnet_cidrs)

  vpc_id                  = aws_vpc.vulntrack.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = merge(
    local.subnet_tags,
    { Name = "${local.name}-public-${count.index + 1}" }
  )
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}
