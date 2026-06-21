provider "aws" {
  region  = var.region
  profile = var.profile
}

# Reads the token from the CLOUDFLARE_API_TOKEN environment variable
provider "cloudflare" {}

# helm + kubernetes target the cluster this same config creates. On the very first
# apply the endpoint is unknown until module.eks finishes; if Terraform balks, run
#   terraform apply -target=module.eks
# once, then a full apply. Teardown is a single `terraform destroy`.
provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name, "--region", var.region]
  }
}

provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name, "--region", var.region]
    }
  }
}
