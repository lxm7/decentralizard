# ---------- Lambda execution roles (one per function, least-privilege) ----------

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

locals {
  lambda_basic = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# og-image: write the rendered card under og/* only.
resource "aws_iam_role" "og_image" {
  name               = "decentralizard-pl-og-image"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "og_image_basic" {
  role       = aws_iam_role.og_image.name
  policy_arn = local.lambda_basic
}

data "aws_iam_policy_document" "og_image" {
  statement {
    sid       = "PutOgCards"
    actions   = ["s3:PutObject"]
    resources = ["${local.media_bucket_arn}/og/*"]
  }
}

resource "aws_iam_role_policy" "og_image" {
  name   = "s3-put-og"
  role   = aws_iam_role.og_image.id
  policy = data.aws_iam_policy_document.og_image.json
}

# indexnow: logs only (egress to the internet needs no IAM since it's not in a VPC).
resource "aws_iam_role" "indexnow" {
  name               = "decentralizard-pl-indexnow"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "indexnow_basic" {
  role       = aws_iam_role.indexnow.name
  policy_arn = local.lambda_basic
}

# cloudfront-invalidate: logs + invalidate the media distribution only.
resource "aws_iam_role" "invalidate" {
  name               = "decentralizard-pl-invalidate"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "invalidate_basic" {
  role       = aws_iam_role.invalidate.name
  policy_arn = local.lambda_basic
}

data "aws_iam_policy_document" "invalidate" {
  statement {
    sid       = "Invalidate"
    actions   = ["cloudfront:CreateInvalidation"]
    resources = [local.cf_arn]
  }
}

resource "aws_iam_role_policy" "invalidate" {
  name   = "cloudfront-invalidate"
  role   = aws_iam_role.invalidate.id
  policy = data.aws_iam_policy_document.invalidate.json
}

# authorizer: logs only.
resource "aws_iam_role" "authorizer" {
  name               = "decentralizard-pl-authorizer"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "authorizer_basic" {
  role       = aws_iam_role.authorizer.name
  policy_arn = local.lambda_basic
}

# ---------- Step Functions role: invoke the three task Lambdas ----------

data "aws_iam_policy_document" "sfn_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["states.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "sfn" {
  name               = "decentralizard-pl-sfn"
  assume_role_policy = data.aws_iam_policy_document.sfn_assume.json
}

data "aws_iam_policy_document" "sfn" {
  statement {
    sid     = "InvokeTasks"
    actions = ["lambda:InvokeFunction"]
    resources = [
      aws_lambda_function.og_image.arn,
      aws_lambda_function.indexnow.arn,
      aws_lambda_function.invalidate.arn,
    ]
  }
}

resource "aws_iam_role_policy" "sfn" {
  name   = "invoke-tasks"
  role   = aws_iam_role.sfn.id
  policy = data.aws_iam_policy_document.sfn.json
}

# ---------- EventBridge → Step Functions role ----------

data "aws_iam_policy_document" "eventbridge_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "eventbridge_sfn" {
  name               = "decentralizard-pl-eventbridge"
  assume_role_policy = data.aws_iam_policy_document.eventbridge_assume.json
}

data "aws_iam_policy_document" "eventbridge_sfn" {
  statement {
    sid       = "StartPipeline"
    actions   = ["states:StartExecution"]
    resources = [aws_sfn_state_machine.pipeline.arn]
  }
}

resource "aws_iam_role_policy" "eventbridge_sfn" {
  name   = "start-pipeline"
  role   = aws_iam_role.eventbridge_sfn.id
  policy = data.aws_iam_policy_document.eventbridge_sfn.json
}

# ---------- API Gateway → EventBridge role (direct service integration) ----------

data "aws_iam_policy_document" "apigw_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["apigateway.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "apigw_eventbridge" {
  name               = "decentralizard-pl-apigw"
  assume_role_policy = data.aws_iam_policy_document.apigw_assume.json
}

data "aws_iam_policy_document" "apigw_eventbridge" {
  statement {
    sid       = "PutEvents"
    actions   = ["events:PutEvents"]
    resources = [aws_cloudwatch_event_bus.pipeline.arn]
  }
}

resource "aws_iam_role_policy" "apigw_eventbridge" {
  name   = "put-events"
  role   = aws_iam_role.apigw_eventbridge.id
  policy = data.aws_iam_policy_document.apigw_eventbridge.json
}
