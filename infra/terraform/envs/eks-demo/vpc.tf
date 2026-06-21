data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  name = "decentralizard-eks"
  azs  = slice(data.aws_availability_zones.available.names, 0, 2)

  tags = {
    project = "decentralizard"
    managed = "terraform"
    tier    = "eks-demo"
  }
}

# Public-subnet-only VPC. No NAT gateway (saves ~$32/mo); nodes sit in public
# subnets with public IPs so they reach ECR/the internet directly — acceptable
# for an ephemeral demo cluster that only exists during a `terraform apply`.
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = local.name
  cidr = var.vpc_cidr

  azs            = local.azs
  public_subnets = [for i, _ in local.azs : cidrsubnet(var.vpc_cidr, 8, i)]

  enable_nat_gateway      = false
  map_public_ip_on_launch = true
  enable_dns_hostnames    = true

  # Tag so the AWS Load Balancer Controller discovers subnets for internet-facing ALBs
  public_subnet_tags = {
    "kubernetes.io/role/elb"              = "1"
    "kubernetes.io/cluster/${local.name}" = "shared"
  }

  tags = local.tags
}
