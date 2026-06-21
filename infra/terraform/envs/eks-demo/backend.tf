terraform {
  backend "s3" {
    bucket         = "decentralizard-tfstate-158871758094"
    key            = "eks-demo/terraform.tfstate"
    region         = "eu-west-1"
    profile        = "default"
    dynamodb_table = "decentralizard-tf-lock"
    encrypt        = true
  }
}
