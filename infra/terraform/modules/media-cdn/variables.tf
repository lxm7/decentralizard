variable "bucket_name" {
  type = string
}

variable "cdn_domain" {
  type = string
}

variable "acm_certificate_arn" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
