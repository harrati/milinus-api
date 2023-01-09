import { Scalar } from '@nestjs/graphql'
import { GraphQLUpload } from 'graphql-upload'
import { FileUpload } from 'graphql-upload'

@Scalar('Upload')
export class Upload {
  description = 'Upload custom scalar type'

  parseValue(value: Promise<FileUpload>) {
    return GraphQLUpload.parseValue(value)
  }

  serialize(value: any) {
    return GraphQLUpload.serialize(value)
  }

  parseLiteral(ast: any) {
    return GraphQLUpload.parseLiteral(ast, {})
  }
}
