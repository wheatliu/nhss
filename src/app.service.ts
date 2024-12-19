import { Injectable } from '@nestjs/common';
import { TransactionService } from './transaction/transaction.service';
import { Transaction, TransactionType } from './transaction/transaction.entity';

@Injectable()
export class AppService {
  constructor(private readonly transactionService: TransactionService) {}

  async createNFTTransaction(): Promise<Transaction> {
    const transaction: Transaction = {
      transferFrom: 'transferFrom',
      transferTo: 'transferTo',
      tokenID: 1,
      blockNumber: 1,
      transactionType: TransactionType.TRANSFER,
      transferredAt: new Date(),
      id: 0,
      contractAddress: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.transactionService.createNFTTransaction(transaction);
    return transaction;
  }

  getHello(): string {
    return 'Hello World!';
  }
}
