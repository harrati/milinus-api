import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { GqlExecutionContext } from '@nestjs/graphql'
import { LibsService } from '../libs/libs.service'
import { isString, isUndefined, includes } from 'lodash'
import { fileFields, IField } from './file-fields'

@Injectable()
export class GraphqlFileFieldsInterceptor implements NestInterceptor {
  private fields: Array<IField>

  constructor(@Inject(LibsService) private readonly libs: LibsService) {
    this.fields = fileFields
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const ctx = GqlExecutionContext.create(context)
    const args = ctx.getArgs()

    for (const field of this.fields) {
      const grahqlUpload = isUndefined(args['data'])
        ? args[field.name]
        : args['data'][field.name]

      if (isUndefined(grahqlUpload) || isString(grahqlUpload)) continue

      const { mimetype } = await grahqlUpload
      const { allowedTypes, folder } = field

      if (!includes(allowedTypes, await mimetype)) {
        throw new Error(
          `Not Allowed mimetype ${mimetype}, allowed types: ${allowedTypes}`
        )
      }

      const filePath = await this.libs.firebase.uploadFileFromGraphQLUpload(
        grahqlUpload,
        folder
      )
      args['data']
        ? (args['data'][field.name] = filePath)
        : (args[field.name] = filePath)
    }
    return next.handle()
  }
}
