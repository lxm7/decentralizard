data "aws_caller_identity" "current" {}

# Always-on baseline owns the media bucket + CloudFront distribution.
data "terraform_remote_state" "always_on" {
  backend = "s3"
  config = {
    bucket  = "decentralizard-tfstate-158871758094"
    key     = "always-on/terraform.tfstate"
    region  = "eu-west-1"
    profile = var.profile
  }
}

# Secrets are seeded once out-of-band (see README) and only read here, so the
# create-then-read chicken/egg never bites a single apply.
data "aws_ssm_parameter" "api_secret" {
  name = var.api_secret_param
}

data "aws_ssm_parameter" "indexnow_key" {
  name = var.indexnow_key_param
}

locals {
  account_id       = data.aws_caller_identity.current.account_id
  media_bucket     = data.terraform_remote_state.always_on.outputs.media_bucket
  media_bucket_arn = data.terraform_remote_state.always_on.outputs.media_bucket_arn
  cf_distribution  = data.terraform_remote_state.always_on.outputs.cloudfront_distribution_id
  cf_arn           = "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${data.terraform_remote_state.always_on.outputs.cloudfront_distribution_id}"
}
