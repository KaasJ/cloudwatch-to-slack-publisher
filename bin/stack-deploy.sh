#!/usr/bin/env bash

set -u # fail if var is not set
set -e # fail if any of the command fail

STACK_NAME=$1  # the first script's arg
ENVIRONMENT=$2  # the second script's arg

#STACK_PREFIX provided via repository variables 

echo "Deploying stack '$STACK_PREFIX-$STACK_NAME'"
aws cloudformation deploy \
  --template-file "./dist/$STACK_NAME.yml" \
  --stack-name "$STACK_PREFIX-$STACK_NAME" \
  --capabilities CAPABILITY_IAM \
  --no-fail-on-empty-changeset \
  --parameter-overrides "Environment=$ENVIRONMENT" \

