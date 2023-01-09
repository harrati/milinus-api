import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { AuthResolver } from './auth.resolver'
import { JwtStrategy } from './auth.strategy'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtConfig } from '../../config/config.types'

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const { secret } = configService.get<JwtConfig>('jwt')
        const jwtConfig = {
          secret,
          signOptions: { expiresIn: '1y' },
        }
        return jwtConfig
      },
      inject: [ConfigService],
    }),
  ],
  providers: [JwtStrategy, AuthResolver],
})
export class AuthModule {}
