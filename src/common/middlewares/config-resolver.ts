import { strict as assert } from 'assert'
/* eslint-disable  @typescript-eslint/no-var-requires */
const AWSXRay = require('aws-xray-sdk')
const { SSM } = process.env._X_AMZN_TRACE_ID
  ? AWSXRay.captureAWS(require('aws-sdk'))
  : require('aws-sdk')
/* eslint-disable  @typescript-eslint/no-var-requires */

import {} from 'aws-sdk'
import { MiddlewareObj } from '@middy/core'

const awsRegion = 'eu-central-1'

const ssm: AWS.SSM = new SSM({ region: awsRegion })
const ssmCache: Map<string, string> = new Map()

export interface Config {
  [key: string]: string
}

/*
Example usage:
resolve://ssm/services/SolarEdge'
resolve://value/#pv.monitoring.db.credentials'
*/
export const getSSMParam = async (name: string): Promise<string> => {
  if (ssmCache.has(name)) {
    return ssmCache.get(name)!
  }

  console.info(`Retrieving SSM parameter ${name}`)
  const data = await ssm
    .getParameter({
      Name: name,
      WithDecryption: true,
    })
    .promise()
  console.log('Retrieved value of the SSM parameter')
  if (!data || !data.Parameter || !data.Parameter.Value) throw new Error(`SSM:${name} not found`)
  const paramValue = data.Parameter.Value
  ssmCache.set(name, paramValue)
  return paramValue
}

export const resolveConfigVar = async (connectionUrl: string): Promise<string> => {
  console.log(`Resolving environment variable: ${connectionUrl}`)
  try {
    const { protocol, host, pathname } = new URL(connectionUrl)
    if (protocol === 'resolve:') {
      if (host === 'ssm') return await getSSMParam(pathname)
      if (host === 'value') {
        return connectionUrl.slice(connectionUrl.indexOf('#') + 1)
      }
    }
    assert.fail(`Unknown protocol. Configuration error`)
  } catch (error) {
    throw `Unable to resolve ${connectionUrl}: ${error}`
  }
}

type ConfigResolver = (v: string[]) => MiddlewareObj

export const configResolver: ConfigResolver = (configVars) => ({
  before: async (handler) => {
    const config: Record<string, any> = {}
    for (const item of configVars) {
      const url = process.env[item]
      if (!url) throw `Missing environment variable ${item}`
      config[item] = await resolveConfigVar(url)
    }
    Object.assign(handler.context, { config })
  },
})
