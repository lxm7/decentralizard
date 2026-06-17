provider "aws" {
  region  = var.region
  profile = var.profile
}

# CloudFront requires its ACM certificate in us-east-1
provider "aws" {
  alias   = "us_east_1"
  region  = "us-east-1"
  profile = var.profile
}

# Reads the token from the CLOUDFLARE_API_TOKEN environment variable
provider "cloudflare" {}
