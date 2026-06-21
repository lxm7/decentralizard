locals {
  lambda_src = "${path.module}/../../../lambda"
}

# ---------- zip Lambdas (single-file handlers, runtime-provided deps) ----------

data "archive_file" "indexnow" {
  type        = "zip"
  source_file = "${local.lambda_src}/indexnow-ping/index.mjs"
  output_path = "${path.module}/build/indexnow-ping.zip"
}

data "archive_file" "invalidate" {
  type        = "zip"
  source_file = "${local.lambda_src}/cloudfront-invalidate/index.mjs"
  output_path = "${path.module}/build/cloudfront-invalidate.zip"
}

data "archive_file" "authorizer" {
  type        = "zip"
  source_file = "${local.lambda_src}/authorizer/index.mjs"
  output_path = "${path.module}/build/authorizer.zip"
}

# ---------- og-image: container image (satori + resvg native deps) ----------

resource "aws_lambda_function" "og_image" {
  function_name = "decentralizard-og-image"
  role          = aws_iam_role.og_image.arn
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.og_image.repository_url}:${var.og_image_tag}"
  architectures = ["arm64"]
  timeout       = 30
  memory_size   = 1024

  environment {
    variables = {
      MEDIA_BUCKET = local.media_bucket
    }
  }
}

resource "aws_lambda_function" "indexnow" {
  function_name    = "decentralizard-indexnow-ping"
  role             = aws_iam_role.indexnow.arn
  runtime          = "nodejs20.x"
  handler          = "index.handler"
  filename         = data.archive_file.indexnow.output_path
  source_code_hash = data.archive_file.indexnow.output_base64sha256
  architectures    = ["arm64"]
  timeout          = 10

  environment {
    variables = {
      INDEXNOW_KEY = data.aws_ssm_parameter.indexnow_key.value
      SITE_HOST    = var.site_host
    }
  }
}

resource "aws_lambda_function" "invalidate" {
  function_name    = "decentralizard-cloudfront-invalidate"
  role             = aws_iam_role.invalidate.arn
  runtime          = "nodejs20.x"
  handler          = "index.handler"
  filename         = data.archive_file.invalidate.output_path
  source_code_hash = data.archive_file.invalidate.output_base64sha256
  architectures    = ["arm64"]
  timeout          = 15

  environment {
    variables = {
      DISTRIBUTION_ID = local.cf_distribution
    }
  }
}

resource "aws_lambda_function" "authorizer" {
  function_name    = "decentralizard-pipeline-authorizer"
  role             = aws_iam_role.authorizer.arn
  runtime          = "nodejs20.x"
  handler          = "index.handler"
  filename         = data.archive_file.authorizer.output_path
  source_code_hash = data.archive_file.authorizer.output_base64sha256
  architectures    = ["arm64"]
  timeout          = 5

  environment {
    variables = {
      PIPELINE_SECRET = data.aws_ssm_parameter.api_secret.value
    }
  }
}

# CloudWatch log groups with a short retention (cost) for each function.
resource "aws_cloudwatch_log_group" "og_image" {
  name              = "/aws/lambda/${aws_lambda_function.og_image.function_name}"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "indexnow" {
  name              = "/aws/lambda/${aws_lambda_function.indexnow.function_name}"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "invalidate" {
  name              = "/aws/lambda/${aws_lambda_function.invalidate.function_name}"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "authorizer" {
  name              = "/aws/lambda/${aws_lambda_function.authorizer.function_name}"
  retention_in_days = 14
}
