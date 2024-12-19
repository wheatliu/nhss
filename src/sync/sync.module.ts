import { TransactionModule } from 'src/transaction/transaction.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from 'src/redis/redis.module';
import { createNFTHolderSyncingProviders } from './nft-holder-syncing.provider';
import { INFTHolderSyncServiceConfig } from './nft-holder-syncing-service.interface';
import { DynamicModule, Module } from '@nestjs/common';

@Module({})
export class SyncModule {
  static forRootAsync(
    configList: Array<INFTHolderSyncServiceConfig>,
  ): DynamicModule {
    const syncingProviders = createNFTHolderSyncingProviders(configList);
    return {
      module: SyncModule,
      imports: [TransactionModule, ConfigModule, RedisModule],
      providers: [...syncingProviders],
      exports: [...syncingProviders],
    };
  }
}
