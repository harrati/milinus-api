import { SetMetadata } from '@nestjs/common'

export const Sponsorship = (sponsorship: string) =>
  SetMetadata('sponsorship', sponsorship)
