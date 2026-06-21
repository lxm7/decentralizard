module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = local.name
  cluster_version = var.cluster_version

  # Public API endpoint so a laptop can run kubectl/helm during the demo.
  cluster_endpoint_public_access = true

  # Map the current Terraform caller as a cluster admin (access entry API).
  enable_cluster_creator_admin_permissions = true

  cluster_addons = {
    coredns                = {}
    kube-proxy             = {}
    vpc-cni                = { before_compute = true }
    eks-pod-identity-agent = { before_compute = true }
  }

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.public_subnets
  control_plane_subnet_ids = module.vpc.public_subnets

  eks_managed_node_groups = {
    default = {
      ami_type       = "AL2023_ARM_64_STANDARD"
      instance_types = var.node_instance_types
      capacity_type  = "SPOT"

      min_size     = 1
      max_size     = 3
      desired_size = var.node_desired_size

      # Nodes live in public subnets — give them public IPs to pull images
      # without a NAT gateway.
      subnet_ids = module.vpc.public_subnets
    }
  }

  tags = local.tags
}
