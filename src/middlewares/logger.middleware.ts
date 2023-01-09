import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: Function) {
    const start = Date.now()
    await next()
    if (req.body.operationName === 'IntrospectionQuery') return
    const ms = Date.now() - start
    if (process.env.NODE_ENV !== 'TEST') {
      console.log(
        `${req.method} operation: ${req.body.operationName ||
          null} - duration: ${ms}ms`
      )
    }
  }
}
