resource "aws_apigatewayv2_api" "pipeline" {
  name          = "decentralizard-pipeline"
  protocol_type = "HTTP"
  description   = "Publish-hook ingress → EventBridge (direct service integration)."
}

# Shared-secret REQUEST authorizer: keeps the publish endpoint keyless on the
# app side (hook just sends an Authorization header — no AWS SDK / sigv4).
resource "aws_apigatewayv2_authorizer" "secret" {
  api_id                            = aws_apigatewayv2_api.pipeline.id
  name                              = "shared-secret"
  authorizer_type                   = "REQUEST"
  authorizer_uri                    = aws_lambda_function.authorizer.invoke_arn
  identity_sources                  = ["$request.header.Authorization"]
  authorizer_payload_format_version = "2.0"
  enable_simple_responses           = true
  authorizer_result_ttl_in_seconds  = 300
}

resource "aws_lambda_permission" "authorizer" {
  statement_id  = "AllowApiGwInvokeAuthorizer"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.authorizer.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.pipeline.execution_arn}/authorizers/${aws_apigatewayv2_authorizer.secret.id}"
}

# Direct AWS service integration — no proxy Lambda in the data path. The request
# body becomes the EventBridge event Detail.
resource "aws_apigatewayv2_integration" "eventbridge" {
  api_id                 = aws_apigatewayv2_api.pipeline.id
  integration_type       = "AWS_PROXY"
  integration_subtype    = "EventBridge-PutEvents"
  credentials_arn        = aws_iam_role.apigw_eventbridge.arn
  payload_format_version = "1.0"

  request_parameters = {
    "Source"       = "decentralizard.cms"
    "DetailType"   = "post.published"
    "Detail"       = "$request.body"
    "EventBusName" = aws_cloudwatch_event_bus.pipeline.name
  }
}

resource "aws_apigatewayv2_route" "publish" {
  api_id             = aws_apigatewayv2_api.pipeline.id
  route_key          = "POST /publish"
  target             = "integrations/${aws_apigatewayv2_integration.eventbridge.id}"
  authorization_type = "CUSTOM"
  authorizer_id      = aws_apigatewayv2_authorizer.secret.id
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.pipeline.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 5
    throttling_rate_limit  = 10
  }
}
