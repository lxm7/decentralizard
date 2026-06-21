provider "aws" {
  region  = var.region
  profile = var.profile
  default_tags {
    tags = {
      Project = "decentralizard"
      Env     = "lambda-pipeline"
      Managed = "terraform"
    }
  }
}
