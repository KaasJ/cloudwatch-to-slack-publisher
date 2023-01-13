#!/usr/bin/env bash


# for deployment from localhost
export AWS_PROFILE=sun-acceptance
export AWS_DEFAULT_REGION=eu-central-1
export AWS_REGION=$AWS_DEFAULT_REGION
export S3_BUCKET=sungevity-sam-deployment-packages-acceptance

# for running sam local invoke
export ENVIRONMENT=acc
 
