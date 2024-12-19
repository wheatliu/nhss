import { TransactionType } from 'src/transaction/transaction.entity';

export interface NFTTransfer {
  from: string;
  to: string;
  tokenId: number;
  blockNumber: number;
  timestamp: number;
  contractAddress: string;
  transferType: TransactionType;
}
