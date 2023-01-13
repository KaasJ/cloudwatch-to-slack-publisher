#!/usr/bin/env bash

set -u # fail if var is not set
set -e # fail if any of the command fail

STACK_NAME=$1  # the first script's arg
#STACK_PREFIX provided via repository variables 

echo "Creating packaged template for stack '$STACK_PREFIX-$STACK_NAME'"
aws cloudformation package \
  --template-file "./cloudformation-stacks/$STACK_NAME.yml" \
  --output-template-file "./dist/$STACK_NAME.yml" \
  --s3-bucket "$S3_BUCKET" \
