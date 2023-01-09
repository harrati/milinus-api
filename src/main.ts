import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Logger, INestApplication, ValidationPipe } from '@nestjs/common'
import { AppConfig } from './config/config.types'
import { ConfigService } from '@nestjs/config'

let app: INestApplication

async function bootstrap(): Promise<void> {
  app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)
  const { port } = config.get<AppConfig>('app')
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(port, () =>
    Logger.log(
      `
      =====================================================================================
      -> NestJS GraphQL server is running on port ${port} 🏃
      =====================================================================================
      `
    )
  )
}

bootstrap()

process.on('SIGINT', () => {
  Logger.log('Server stopped')
  app.close()
})
