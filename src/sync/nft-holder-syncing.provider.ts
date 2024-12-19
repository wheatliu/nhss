import { Redis } from 'ioredis';
import { EVMCompatibleNFTHolderSyncingService } from './evm-compatible-syncing.service';
import {
  INFTHolderSyncService,
  INFTHolderSyncServiceConfig,
} from './nft-holder-syncing-service.interface';
import { getSyncingServiceToken } from './nft-holder-syncing.utils';
import { Provider } from '@nestjs/common';
import { TransactionService } from 'src/transaction/transaction.service';

function nftHolderSyncingFactory(
  redisCli: Redis,
  transactionService: TransactionService,
  syncingConfig: INFTHolderSyncServiceConfig,
) {
  if (syncingConfig.IS_EVM_COMPATIBLE) {
    const logPrefix = getSyncingServiceToken(
      syncingConfig.SYMBOL,
      syncingConfig.CHAIN_NAME,
      syncingConfig.NETWORK,
    );

    return new EVMCompatibleNFTHolderSyncingService(
      transactionService,
      redisCli,
      syncingConfig,
      logPrefix,
    );
  }
}

function createNFTHolderSyncingProvider(
  syncingConfig: INFTHolderSyncServiceConfig,
): Provider<INFTHolderSyncService> {
  return {
    provide: getSyncingServiceToken(
      syncingConfig.SYMBOL,
      syncingConfig.CHAIN_NAME,
      syncingConfig.NETWORK,
    ),
    useFactory: async (
      redisCli: Redis,
      transactionService: TransactionService,
    ) => {
      return nftHolderSyncingFactory(
        redisCli,
        transactionService,
        syncingConfig,
      );
    },
    inject: ['REDIS_CLIENT', TransactionService],
  };
}

export function createNFTHolderSyncingProviders(
  configList: Array<INFTHolderSyncServiceConfig>,
): Array<Provider<INFTHolderSyncService>> {
  return configList.map((config) => {
    return createNFTHolderSyncingProvider(config);
  });
}
