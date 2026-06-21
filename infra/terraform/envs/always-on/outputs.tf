output "media_bucket" {
  value = module.media_cdn.bucket_name
}

output "media_bucket_arn" {
  value = module.media_cdn.bucket_arn
}

output "cdn_domain" {
  value = local.media_fqdn
}

output "cloudfront_domain" {
  value = module.media_cdn.cloudfront_domain_name
}

output "cloudfront_distribution_id" {
  value = module.media_cdn.cloudfront_distribution_id
}

output "ecr_repository_url" {
  value = module.ecr.repository_url
}

output "media_writer_access_key_id" {
  value = module.iam.media_writer_access_key_id
}

output "media_writer_secret_access_key" {
  value     = module.iam.media_writer_secret_access_key
  sensitive = true
}

output "gitlab_ci_role_arn" {
  value = module.iam.gitlab_ci_role_arn
}
