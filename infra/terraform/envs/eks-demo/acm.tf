locals {
  app_fqdn = "${var.app_subdomain}.${var.root_domain}"
}

# ALB cert must live in the ALB's region (eu-west-1), unlike CloudFront (us-east-1).
resource "aws_acm_certificate" "app" {
  domain_name       = local.app_fqdn
  validation_method = "DNS"
  tags              = local.tags

  lifecycle {
    create_before_destroy = true
  }
}

resource "cloudflare_dns_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.app.domain_validation_options : dvo.domain_name => {
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

resource "aws_acm_certificate_validation" "app" {
  certificate_arn         = aws_acm_certificate.app.arn
  validation_record_fqdns = [for dvo in aws_acm_certificate.app.domain_validation_options : dvo.resource_record_name]

  depends_on = [cloudflare_dns_record.acm_validation]
}
