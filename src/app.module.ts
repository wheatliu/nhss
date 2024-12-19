import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SyncModule } from './sync/sync.module';
import { TransactionModule } from './transaction/transaction.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import configuration from './config/configuration';
import { INFTHolderSyncServiceConfig } from './sync/nft-holder-syncing-service.interface';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('DATABASE'),
    }),
    TransactionModule,
    RedisModule,
    SyncModule.forRootAsync(
      configuration().NFTS.map((config) => {
        const syncingConfig: INFTHolderSyncServiceConfig = { ...config };
        return syncingConfig;
      }),
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
