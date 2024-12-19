import { Redis } from 'ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const RedisProvider = {
  imports: [ConfigModule],
  provide: 'REDIS_CLIENT',
  useFactory: (configService: ConfigService) => {
    const redis = new Redis(configService.get('REDIS'));
    return redis;
  },
  inject: [ConfigService],
};
