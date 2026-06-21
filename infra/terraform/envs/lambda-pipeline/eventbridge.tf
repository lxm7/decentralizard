resource "aws_cloudwatch_event_bus" "pipeline" {
  name = "decentralizard-pipeline"
}

resource "aws_cloudwatch_event_rule" "published" {
  name           = "post-published"
  event_bus_name = aws_cloudwatch_event_bus.pipeline.name
  description    = "Fires the publish pipeline when the CMS emits post.published."
  event_pattern = jsonencode({
    source        = ["decentralizard.cms"]
    "detail-type" = ["post.published"]
  })
}

# Pass only the event detail to the state machine so its input is the flat
# { slug, title, author, category, url } payload the Lambdas expect.
resource "aws_cloudwatch_event_target" "sfn" {
  rule           = aws_cloudwatch_event_rule.published.name
  event_bus_name = aws_cloudwatch_event_bus.pipeline.name
  arn            = aws_sfn_state_machine.pipeline.arn
  role_arn       = aws_iam_role.eventbridge_sfn.arn
  input_path     = "$.detail"
}
