import got from 'got'
import { DateTime } from 'luxon'
import { GetLogRecordResponse } from 'aws-sdk/clients/cloudwatchlogs'

export async function sendToSlack(blocks: Object[], channel: string, url: string) {
  const payload = {
    blocks,
    channel,
  }
  const response = await got.post(url, {
    body: JSON.stringify(payload),
    throwHttpErrors: false,
    timeout: 15000,
  })

  // This makes the errors more descriptive
  if (response.statusCode !== 200)
    throw new Error(`Slack responded non-200. Error: ${JSON.stringify(response.body, null, 2)}`)
  console.log('Slack response', response.body, response.statusCode)
}

// max of 50 blocks
export function getBlocks(logRecords?: GetLogRecordResponse[], logGroupNamePrefix?: string) {
  const blocks = []
  const environment = process.env.ENVIRONMENT === 'acc' ? 'Acceptance' : 'Production'
  const region = process.env.AWS_REGION

  if (logRecords) {
    blocks.push(
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `Found new alert(s) in log group ${logGroupNamePrefix} - ${environment}`,
        },
      },
      {
        type: 'divider',
      },
      ...logRecords
        .map((lr) => lr.logRecord)
        .flatMap((l) => {
          const time = DateTime.fromMillis(Number(l?.['@timestamp']))
          const logGroup = l?.['@log'].split(':')[1]
          const logStream = l?.['@logStream']
          const url = encodeURI(
            `https://console.aws.amazon.com/cloudwatch/home?region=${region}#logEventViewer:group=${logGroup};stream=${logStream};start=${time}`
          )
          const errorMessage = (l?.errorMessage || l?.['@message'])?.slice(0, 250)
          console.log('Error message:', JSON.stringify(errorMessage, null, 2))

          return [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Error*: ${errorMessage} *Time*: ${time} *Log group*: ${l?.['@log']}`,
              },
              accessory: {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'More',
                },
                url,
              },
            },
            {
              type: 'divider',
            },
          ]
        })
    )
  } else {
    blocks.push({
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: 'Cloudwatch Slack publisher *failed*',
        },
      ],
    })
  }
  return blocks
}
