export const NFT_HOLDER_SYNC_SERVICE = 'NFT HOLDER SYNC SERVICE';

export interface INFTHolderSyncService {
  contractAddress: string;
  currentBlockNumber: number;
  blockPageSize: number;
  rpcURL: string;
  sync(startBlockNum, endBlockNum: number): Promise<void>;
  run(): Promise<void>;
}

export interface INFTHolderSyncServiceConfig {
  SYMBOL: string;
  CHAIN_NAME: string;
  NETWORK: string;
  CONTRACT_ADDRESS: string;
  STARTED_BLOCK_NUMBER: number;
  RPC: string;
  WSS_RPC: string;
  PAGE_SIZE: number;
  IS_EVM_COMPATIBLE: boolean;
  PERSISTENCE: boolean;
  CACHING: boolean;
  PollingInterval: number;
}
