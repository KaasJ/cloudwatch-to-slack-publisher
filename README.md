# Cloudwatch to Slack Publisher

An api that filters AWS Cloudwatch logs and publishes results to Slack. The api is invoked by a scheduled event (cron job). 

The goal of this api is to simplify monitoring of a large backend system with (serverless) microservice architecture setup in AWS.

**Please note that this is an _example_ project and a stripped down version of the original API**

## Local development
You will need [SAM-CLI](https://github.com/awslabs/aws-sam-cli) to run this api.

- Run `npm run dev` to install dependencies
- Run `npm run watch`
- Invoke the lambda using `npm run cloudwatch-slack-publisher`. You can edit the lambda input in the `cloudwatch-slack-publisher.json` file in the task-examples folder. 


## Configuration
  You configure the api in the `cloudwatch-alert-publisher.yml` file in the `cloudformation` folder. Here you can set the input variable or change the schedule of the cron job. Please find an example input below.


```json
{ 
  "logGroupNamePrefix": "/aws/lambda/yourLogGroupNamePrefix",
  "lagInMinutes": 60,
  "queryString": "fields @timestamp, @message | sort @message | filter @message like /Invoke Error|timed out|Main exception/",
  "queryResultLimit": 100,
  "maxLogGroups": 50,
  "channel": "#monitoring"
}
```

## Deployments
Deployments are handled by Bitbucket Pipelines (config in `bitbucket-pipelines.yml`) and make use of SAM, a layer on top of Cloudformation created by AWS.

