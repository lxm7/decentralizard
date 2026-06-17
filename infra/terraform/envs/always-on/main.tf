data "aws_caller_identity" "current" {}

locals {
  media_fqdn   = "${var.media_subdomain}.${var.root_domain}"
  media_bucket = "decentralizard-media-${data.aws_caller_identity.current.account_id}"

  tags = {
    project = "decentralizard"
    managed = "terraform"
    tier    = "always-on"
  }
}

# --- ACM cert for the CDN domain (CloudFront → must be us-east-1) ---
resource "aws_acm_certificate" "cdn" {
  provider          = aws.us_east_1
  domain_name       = local.media_fqdn
  validation_method = "DNS"
  tags              = local.tags

  lifecycle {
    create_before_destroy = true
  }
}

resource "cloudflare_dns_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cdn.domain_validation_options : dvo.domain_name => {
      name    = dvo.resource_record_name
      type    = dvo.resource_record_type
      content = dvo.resource_record_value
    }
  }

  zone_id = var.cloudflare_zone_id
  name    = each.value.name
  type    = each.value.type
  content = each.value.content
  ttl     = 60
  proxied = false
}

resource "aws_acm_certificate_validation" "cdn" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.cdn.arn
  validation_record_fqdns = [for dvo in aws_acm_certificate.cdn.domain_validation_options : dvo.resource_record_name]

  depends_on = [cloudflare_dns_record.acm_validation]
}

# --- Media bucket + CloudFront ---
module "media_cdn" {
  source = "../../modules/media-cdn"

  bucket_name         = local.media_bucket
  cdn_domain          = local.media_fqdn
  acm_certificate_arn = aws_acm_certificate_validation.cdn.certificate_arn
  tags                = local.tags
}

# cdn.decentralizard.com -> CloudFront (DNS-only; CloudFront brings its own TLS + Shield)
resource "cloudflare_dns_record" "cdn" {
  zone_id = var.cloudflare_zone_id
  name    = local.media_fqdn
  type    = "CNAME"
  content = module.media_cdn.cloudfront_domain_name
  ttl     = 1
  proxied = false
}

# --- ECR ---
module "ecr" {
  source = "../../modules/ecr"
  name   = "decentralizard"
  tags   = local.tags
}

# --- IAM: media writer (Oracle) + GitLab CI OIDC ---
module "iam" {
  source = "../../modules/iam"

  media_bucket_arn    = module.media_cdn.bucket_arn
  ecr_repository_arn  = module.ecr.repository_arn
  gitlab_project_path = var.gitlab_project_path
  tags                = local.tags
}
