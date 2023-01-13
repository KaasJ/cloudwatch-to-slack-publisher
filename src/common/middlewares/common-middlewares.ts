import { configResolver } from 'common/middlewares/config-resolver'
import cors from '@middy/http-cors'
import { MiddlewareObj } from '@middy/core'

export default (configVars: string[] = []): MiddlewareObj[] => [cors(), configResolver(configVars)]
