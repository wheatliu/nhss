import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { getSyncingServiceToken } from './sync/nft-holder-syncing.utils';
import { INFTHolderSyncService } from './sync/nft-holder-syncing-service.interface';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  app.useLogger(configService.get('LogLevel'));

  let nftHolderSyncingConfigList = configService.get('NFTS');
  if (typeof nftHolderSyncingConfigList === 'string') {
    nftHolderSyncingConfigList = JSON.parse(nftHolderSyncingConfigList);
  }
  const tasks = [];
  for (const nftHolderSyncingConfig of nftHolderSyncingConfigList) {
    const providerName = getSyncingServiceToken(
      nftHolderSyncingConfig.SYMBOL,
      nftHolderSyncingConfig.CHAIN_NAME,
      nftHolderSyncingConfig.NETWORK,
    );
    const provider = app.get<INFTHolderSyncService>(providerName);
    tasks.push(provider);
  }
  await Promise.all(tasks.map((task) => task.run()));
  await app.close();
}

bootstrap();
