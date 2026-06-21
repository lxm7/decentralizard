output "publish_endpoint" {
  description = "POST here from the Payload publish hook (Authorization: <api-secret>)."
  value       = "${aws_apigatewayv2_api.pipeline.api_endpoint}/publish"
}

output "og_image_repository_url" {
  description = "ECR repo CI pushes the og-image container to."
  value       = aws_ecr_repository.og_image.repository_url
}

output "state_machine_arn" {
  value = aws_sfn_state_machine.pipeline.arn
}

output "event_bus_name" {
  value = aws_cloudwatch_event_bus.pipeline.name
}
