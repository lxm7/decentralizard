variable "region" {
  type    = string
  default = "eu-west-1"
}

variable "profile" {
  type    = string
  default = "default"
}

variable "site_host" {
  type        = string
  default     = "decentralizard.com"
  description = "Public site host, used for IndexNow host + keyLocation."
}

variable "og_image_tag" {
  type        = string
  default     = "latest"
  description = "Tag of the og-image container image in ECR (CI pushes :latest)."
}

variable "api_secret_param" {
  type        = string
  default     = "/decentralizard/pipeline/api-secret"
  description = "SSM SecureString holding the shared secret the publish hook sends. Seed once before apply."
}

variable "indexnow_key_param" {
  type        = string
  default     = "/decentralizard/pipeline/indexnow-key"
  description = "SSM SecureString holding the IndexNow key. Seed once before apply."
}
