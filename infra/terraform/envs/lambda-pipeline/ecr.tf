# Dedicated repo for the og-image container Lambda. CI (build-og-image job)
# pushes :latest here; the Lambda below references it.
resource "aws_ecr_repository" "og_image" {
  name                 = "decentralizard-og-image"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

# Keep only the last few images — this repo just holds :latest + a couple SHAs.
resource "aws_ecr_lifecycle_policy" "og_image" {
  repository = aws_ecr_repository.og_image.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "expire untagged"
      selection = {
        tagStatus   = "untagged"
        countType   = "sinceImagePushed"
        countUnit   = "days"
        countNumber = 7
      }
      action = { type = "expire" }
    }]
  })
}
