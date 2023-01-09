import { SetMetadata } from '@nestjs/common'

export const ProtectedParams = (params: string[]) =>
  SetMetadata('params', params)
