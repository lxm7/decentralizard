variable "region" {
  type    = string
  default = "eu-west-1"
}

variable "profile" {
  type    = string
  default = "default"
}

variable "root_domain" {
  type    = string
  default = "decentralizard.com"
}

variable "media_subdomain" {
  type    = string
  default = "cdn"
}

variable "cloudflare_zone_id" {
  type        = string
  description = "Cloudflare zone ID for decentralizard.com"
}

variable "gitlab_project_path" {
  type        = string
  default     = ""
  description = "e.g. lxm7/decentralizard — empty disables the CI OIDC role"
}
