import { Network } from 'alchemy-sdk';
import { Transaction } from '../transaction/transaction.entity';
import { INFTHolderSyncServiceConfig } from 'src/sync/nft-holder-syncing-service.interface';

export default () => ({
  Debug: process.env.DEBUG || true,
  LogLevel: process.env.DEBUG
    ? ['log', 'warn', 'error']
    : ['error', 'warn', 'log', 'verbose', 'debug'],
  DATABASE: {
    logging: true,
    host: process.env.DATABASE_HOST || '127.0.0.1',
    type: process.env.DATABASE_TYPE || 'postgres',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_DB || 'bctss',
    entities: [Transaction],
    synchronize: false,
  },
  REDIS: {
    port: parseInt(process.env.REDIS_PORT) || 6379,
    host: process.env.REDIS_HOST || '127.0.0.1',
    username: process.env.REDIS_USERNAME || '',
    password: process.env.REDIS_PASSWORD || '',
    db: 0,
  },
  ALCHEMY_NETWORK: process.env.ALCHEMY_NETWORK || Network.MATIC_MUMBAI,
  ALCHEMY_API_KEY:
    process.env.ALCHEMY_API_KEY || 'xxxxxx',
  // NFT config
  NFT_CONTRACT_ADDRESS:
    process.env.NFT_CONTRACT_ADDRESS ||
    '0xxxxxxxxx',
  NFT_BLOCK_NUMBER_WHEN_CREATED:
    parseInt(process.env.NFT_CREATED_BLOCK_NUMBER) || 0,
  // OAT config
  OAT_CONTRACT_ADDRESS:
    process.env.OAT_CONTRACT_ADDRESS ||
    '0xxxxxxxxx',
  OAT_BLOCK_NUMBER_WHEN_CREATED:
    process.env.OAT_BLOCK_NUMBER_WHEN_CREATED || 0,
  OAT_NETWORK: process.env.OAT_NETWORK || Network.MATIC_MUMBAI,
  NFTS: process.env.NFTS
    ? (JSON.parse(process.env.NFTS) as INFTHolderSyncServiceConfig[])
    : [
        {
          SYMBOL: 'xxxxx',
          CHAIN_NAME: 'POLYGON',
          NETWORK: 'AMOY',
          IS_EVM_COMPATIBLE: true,
          CONTRACT_ADDRESS: '0xxxxxxxxx',
          STARTED_BLOCK_NUMBER: 0,
          RPC: 'https://polygon-amoy.g.alchemy.com/v2/xxxxxxx',
          WSS_RPC:
            'wss://polygon-amoy.g.alchemy.com/v2/xxxxxxx',
          PAGE_SIZE: 10000,
          PERSISTENCE: true,
          CACHING: true,
          BlockTime: 2,
          PollingInterval: 60000,
        } as INFTHolderSyncServiceConfig,
      ],
});
