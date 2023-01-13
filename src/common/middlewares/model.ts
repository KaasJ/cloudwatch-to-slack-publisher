import { Config } from 'common/middlewares/config-resolver'

export interface Context extends AWSLambda.Context {
  config: Config
}
