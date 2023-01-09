import { Module } from '@nestjs/common'
import { MailjetService } from './mailjet.service'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule],
  providers: [MailjetService],
  exports: [MailjetService],
})
export class MailjetModule {}
