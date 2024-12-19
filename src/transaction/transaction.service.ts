import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { Transaction } from './transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async createNFTTransaction(
    transaction: Partial<Transaction>,
  ): Promise<Transaction> {
    const newTransaction = this.transactionRepository.create(transaction);
    return this.transactionRepository.save(newTransaction);
  }

  async createTransactionIfNotExists(
    transaction: Partial<Transaction>,
  ): Promise<InsertResult> {
    return this.transactionRepository.upsert(transaction, [
      'transferFrom',
      'transferTo',
      'tokenID',
      'blockNumber',
      'transactionType',
    ]);
  }
}
