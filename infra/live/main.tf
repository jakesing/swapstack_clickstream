terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    bucket = "cloudservices-terraform-state-6975af7d"
    key    = "state/terraform.live.state"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Terraform = true
    }
  }
}

# SQS Policy
data "aws_iam_policy_document" "queue" {
  #  Allow S3 to notify the SQS queue about an event
  statement {
    effect = "Allow"

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions   = ["sqs:SendMessage"]
    resources = ["arn:aws:sqs:*:*:${var.environment}_click_event_s3_queue"]

    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = ["arn:aws:s3:::${var.click_event_bucket_name}"]
    }
  }
}

resource "aws_sqs_queue" "queue" {
  name                       = "${var.environment}_click_event_s3_queue"
  policy                     = data.aws_iam_policy_document.queue.json
  visibility_timeout_seconds = 120
  receive_wait_time_seconds  = 20
}

resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = var.click_event_bucket_name

  queue {
    queue_arn = aws_sqs_queue.queue.arn
    events    = ["s3:ObjectCreated:*"]
  }
}
