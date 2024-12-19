import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisProvider } from './redis.provider';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [RedisProvider, RedisService, ConfigService],
  exports: [RedisProvider, RedisService],
})
export class RedisModule {}
