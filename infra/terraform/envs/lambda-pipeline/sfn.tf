locals {
  retry = [{
    ErrorEquals     = ["States.ALL"]
    MaxAttempts     = 2
    IntervalSeconds = 2
    BackoffRate     = 2
  }]
}

resource "aws_sfn_state_machine" "pipeline" {
  name     = "decentralizard-publish-pipeline"
  role_arn = aws_iam_role.sfn.arn
  type     = "STANDARD"

  definition = jsonencode({
    Comment = "decentralizard publish pipeline: render OG card + ping IndexNow in parallel, then invalidate the card on CloudFront."
    StartAt = "Fanout"
    States = {
      Fanout = {
        Type       = "Parallel"
        ResultPath = "$.fanout"
        Next       = "InvalidateCard"
        Branches = [
          {
            StartAt = "RenderOgCard"
            States = {
              RenderOgCard = {
                Type     = "Task"
                Resource = "arn:aws:states:::lambda:invoke"
                Parameters = {
                  FunctionName = aws_lambda_function.og_image.arn
                  "Payload.$"  = "$"
                }
                Retry = local.retry
                End   = true
              }
            }
          },
          {
            # IndexNow is best-effort: a failed ping must not fail the pipeline.
            StartAt = "PingIndexNow"
            States = {
              PingIndexNow = {
                Type     = "Task"
                Resource = "arn:aws:states:::lambda:invoke"
                Parameters = {
                  FunctionName = aws_lambda_function.indexnow.arn
                  "Payload.$"  = "$"
                }
                Retry = local.retry
                Catch = [{
                  ErrorEquals = ["States.ALL"]
                  ResultPath  = "$.error"
                  Next        = "IndexNowSkipped"
                }]
                End = true
              }
              IndexNowSkipped = { Type = "Succeed" }
            }
          }
        ]
      }
      InvalidateCard = {
        Type     = "Task"
        Resource = "arn:aws:states:::lambda:invoke"
        Parameters = {
          FunctionName = aws_lambda_function.invalidate.arn
          Payload      = { "slug.$" = "$.slug" }
        }
        Retry = local.retry
        End   = true
      }
    }
  })
}
