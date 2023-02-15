import CloudWatchLogs, { QueryResults, StartQueryRequest } from 'aws-sdk/clients/cloudwatchlogs'
import { DateTime } from 'luxon'
import middy from '@middy/core'
import { Context } from 'common/middlewares/model'
import { Handler } from 'aws-lambda'
import { configResolver } from 'common/middlewares/config-resolver'
import { sendToSlack, getBlocks } from './slack'
import { chunk, sleep } from 'common/utils/func'

const cloudwatchLogs = new CloudWatchLogs()

interface CloudwatchSlackPublisherEvent {
  queryString: string
  queryResultLimit: number
  maxLogGroups: number
  logGroupNamePrefix: string
  lagInMinutes: number
  channel: string
}

const cloudwatchSlackPublisher = async (event: CloudwatchSlackPublisherEvent, context: Context) => {
  const currentTime = DateTime.local()
  const url = context.config.SLACK_WEBHOOK

  console.log('Starting Cloudwatch Slack Publisher with event', JSON.stringify(event, null, 2))
  const {
    channel,
    logGroupNamePrefix,
    maxLogGroups,
    queryResultLimit,
    lagInMinutes,
    queryString,
  } = event

  try {
    const logGroups = await cloudwatchLogs
      .describeLogGroups({
        // max of 50
        limit: maxLogGroups,
        logGroupNamePrefix: logGroupNamePrefix,
      })
      .promise()

    const logGroupNames = logGroups?.logGroups
      // filter out the cloudwatch slack publisher lambda log group
      ?.filter((lg) => lg.logGroupName !== process.env.AWS_LAMBDA_LOG_GROUP_NAME)
      .map((lg) => lg.logGroupName)
    if (!logGroupNames?.length) throw new Error('No log groups found')

    const logGroupsPerChunk = 20
    const chunks = chunk(logGroupNames, logGroupsPerChunk)

    const params: StartQueryRequest = {
      endTime: currentTime.toMillis(),
      startTime: currentTime.minus({ minutes: lagInMinutes }).toMillis(),
      queryString,
      // max of 1000
      limit: queryResultLimit,
    }

    for (let index = 0; index < chunks.length; index++) {
      params.logGroupNames = chunks[index] as string[]

      console.log('Started querying the following log groups', chunks[index])

      const query = await cloudwatchLogs.startQuery(params).promise()
      if (!query?.queryId) throw new Error('Could not retrieve a query id')

      console.log(`Query started with id ${query.queryId}, getting results...`)
      const queryResults = await getQueryResults(query.queryId)

      if (queryResults?.length) {
        console.log(`Found ${queryResults.length} query results`)
        const logRecords = await Promise.all(
          queryResults.map((qr) =>
            cloudwatchLogs
              .getLogRecord({
                logRecordPointer: qr?.[2]?.value || '',
              })
              .promise()
          )
        )

        console.log(`Found ${logRecords.length} log records`)
        // publish to slack
        // limit the number of blocks to 20
        const logRecordsPerChunk = 20
        const chunks = chunk(logRecords, logRecordsPerChunk)

        for (let index = 0; index < chunks.length; index++) {
          await sendToSlack(getBlocks(chunks[index], logGroupNamePrefix), channel, url)
        }
      } else {
        console.log('Found no alerts, no further action needed')
      }
    }
    return 'OK'
    
  } catch (e) {
    await sendToSlack(getBlocks(), channel, url)
    throw new Error(`Cloudwatch slack publisher failed: ${e}`)
  }
}

const getQueryResults = async (queryId: string): Promise<QueryResults | undefined> => {
  const result = await cloudwatchLogs.getQueryResults({ queryId }).promise()
  if (result?.status === 'Complete') {
    console.log(`Query status complete. Found ${result.results?.length} query results`)
    return result.results
  }

  console.log('Fetching query results, current status', result.status)
  await sleep(500)
  return getQueryResults(queryId)
}

const handler = middy((cloudwatchSlackPublisher as any) as Handler).use(
  configResolver(['SLACK_WEBHOOK'])
)
export { handler }
