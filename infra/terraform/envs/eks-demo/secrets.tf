# SSM SecureString placeholders. Terraform owns the *keys*; you fill the real
# values once (Console or `aws ssm put-parameter --overwrite`). ignore_changes
# means subsequent applies never clobber the secrets you set, and they never
# land in tfstate as plaintext.
resource "aws_ssm_parameter" "app_secret" {
  for_each = toset(var.secret_env_keys)

  name  = "${var.ssm_prefix}/${each.value}"
  type  = "SecureString"
  value = "REPLACE_ME"
  tags  = local.tags

  lifecycle {
    ignore_changes = [value]
  }
}
