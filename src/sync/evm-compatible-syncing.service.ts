import { ethers, ZeroAddress } from 'ethers';
import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

import { removeItemFromArray, sleep } from './util';

import { abi } from '../abi/erc721.abi.json';
import { NFTTransfer } from './nft-transfer.interface';
import { TransactionService } from 'src/transaction/transaction.service';
import {
  Transaction,
  TransactionType,
} from 'src/transaction/transaction.entity';
import {
  INFTHolderSyncService,
  INFTHolderSyncServiceConfig,
} from './nft-holder-syncing-service.interface';

@Injectable()
export class EVMCompatibleNFTHolderSyncingService
  implements INFTHolderSyncService
{
  public contractAddress: string;
  public currentBlockNumber: number;
  public rpcURL: string;
  public blockPageSize: number;
  private contract: ethers.Contract;
  private provider: ethers.JsonRpcProvider;
  private logger: Logger;
  private nftHolderRedisKeySuffix: string;
  private syncingConfig: INFTHolderSyncServiceConfig;

  constructor(
    private readonly transactionService: TransactionService,
    private readonly redisClient: Redis,
    syncingConfig: INFTHolderSyncServiceConfig,
    logPrefix: string,
  ) {
    // console.log(this.transactionService);
    this.currentBlockNumber = syncingConfig.STARTED_BLOCK_NUMBER;
    this.contractAddress = syncingConfig.CONTRACT_ADDRESS;
    this.blockPageSize = syncingConfig.PAGE_SIZE;
    this.provider = new ethers.JsonRpcProvider(syncingConfig.RPC);
    this.provider.pollingInterval = syncingConfig.PollingInterval;

    this.contract = new ethers.Contract(
      this.contractAddress,
      abi,
      this.provider,
    );
    this.logger = new Logger(logPrefix);
    const nftRdsKeyPrefix =
      `nft:holders:${syncingConfig.SYMBOL}:${syncingConfig.CHAIN_NAME}`.toLowerCase();
    this.nftHolderRedisKeySuffix = `${nftRdsKeyPrefix}:${this.contractAddress}`;
    this.syncingConfig = syncingConfig;
  }

  private detectTransferType(from: string, to: string): TransactionType {
    if (from === ZeroAddress) {
      return TransactionType.MINT;
    }
    if (to === ZeroAddress) {
      return TransactionType.BURN;
    }
    return TransactionType.TRANSFER;
  }

  private async updateHolderTokensForMint(
    transfer: NFTTransfer,
  ): Promise<void> {
    const { to, tokenId } = transfer;
    const holderTokens = await this.redisClient.hget(
      this.nftHolderRedisKeySuffix,
      to,
    );
    let tokens = [];
    if (holderTokens) {
      tokens = JSON.parse(holderTokens);
    }
    tokens.push(Number(tokenId));
    tokens = [...new Set(tokens)];
    await this.redisClient.hset(
      this.nftHolderRedisKeySuffix,
      to,
      JSON.stringify(tokens),
    );
  }

  private async updateHolderTokensForBurn(
    transfer: NFTTransfer,
  ): Promise<void> {
    const { from, tokenId } = transfer;
    const holderTokens = await this.redisClient.hget(
      this.nftHolderRedisKeySuffix,
      from,
    );
    let tokens = [];
    if (holderTokens) {
      tokens = JSON.parse(holderTokens);
    }
    removeItemFromArray(tokens, Number(tokenId));
    await this.redisClient.hset(
      this.nftHolderRedisKeySuffix,
      from,
      JSON.stringify(tokens),
    );
  }

  private async updateHolderTokensForTransfer(
    transfer: NFTTransfer,
  ): Promise<void> {
    const { from, to, tokenId } = transfer;
    const holders = await this.redisClient.hmget(
      this.nftHolderRedisKeySuffix,
      from,
      to,
    );
    if (holders) {
      const fromHolderTokens = holders[0] || '[]';
      const toHolderTokens = holders[1] || '[]';
      const fromTokens = JSON.parse(fromHolderTokens);
      removeItemFromArray(fromTokens, Number(tokenId));
      let toTokens = JSON.parse(toHolderTokens);
      toTokens.push(Number(tokenId));
      toTokens = [...new Set(toTokens)];
      const updateData = {};
      updateData[from] = JSON.stringify(fromTokens);
      updateData[to] = JSON.stringify(toTokens);
      await this.redisClient.hmset(this.nftHolderRedisKeySuffix, updateData);
      if (fromTokens.length == 0) {
        await this.redisClient.hdel(this.nftHolderRedisKeySuffix, from);
      }
    }
  }

  private async saveTransfers(transfers: Array<NFTTransfer>): Promise<void> {
    for (const transfer of transfers) {
      const transaction = new Transaction();
      transaction.transferFrom = ethers.getAddress(transfer.from);
      transaction.transferTo = ethers.getAddress(transfer.to);
      transaction.blockNumber = transfer.blockNumber;
      transaction.tokenID = transfer.tokenId;
      transaction.transferredAt = new Date();
      transaction.transactionType = transfer.transferType;
      transaction.contractAddress = this.contractAddress;
      await this.transactionService.createTransactionIfNotExists(transaction);
    }
  }

  private async updateHolderTokens(
    transfers: Array<NFTTransfer>,
  ): Promise<void> {
    for (const transfer of transfers) {
      this.logger.log(
        `save token to redis: ${transfer.transferType} ${transfer.tokenId}`,
      );
      if (transfer.transferType === 'MINT') {
        await this.updateHolderTokensForMint(transfer);
      } else if (transfer.transferType === 'BURN') {
        await this.updateHolderTokensForBurn(transfer);
      } else {
        await this.updateHolderTokensForTransfer(transfer);
      }
      this.logger.log(
        `save token to redis done: ${transfer.transferType} ${transfer.tokenId}`,
      );
    }
  }

  async sync(startBlockNum: number, endBlockNum: number): Promise<void> {
    const transfers = await this.fetchTransfers(startBlockNum, endBlockNum);
    if (transfers.length > 0) {
      if (this.syncingConfig.CACHING) {
        await this.updateHolderTokens(transfers);
      }
      if (this.syncingConfig.PERSISTENCE) {
        this.logger.log(`Saving ${transfers.length} transfers`);
        await this.saveTransfers(transfers);
      }
    }
  }

  private async fetchTransfers(
    startBlockNum: number,
    endBlockNum: number,
  ): Promise<Array<NFTTransfer>> {
    const filter = this.contract.filters.Transfer();
    const events = await this.contract.queryFilter(
      filter,
      startBlockNum,
      endBlockNum,
    );
    if (events.length === 0) {
      return [];
    }
    const result: NFTTransfer[] = [];
    for (const event of events) {
      if (event instanceof ethers.EventLog) {
        const { from, to, tokenId } = event.args;
        const nftTransfer: NFTTransfer = {
          from,
          to,
          tokenId: tokenId,
          blockNumber: event.blockNumber,
          timestamp: 0,
          contractAddress: this.contractAddress,
          transferType: this.detectTransferType(from, to),
        };
        result.push(nftTransfer);
        this.logger.log(
          `contract: ${this.contractAddress} blockNumber: ${event.blockNumber} from: ${from}, to: ${to}, tokenId: ${tokenId}`,
        );
      }
    }
    return result;
  }

  private async syncPreviousBlocks(latestBlockNumber): Promise<void> {
    let startBlockNum = this.currentBlockNumber;
    let endBlockNum = startBlockNum + this.blockPageSize;
    if (endBlockNum > latestBlockNumber) {
      endBlockNum = latestBlockNumber;
    }

    while (startBlockNum < latestBlockNumber) {
      await sleep(200);
      this.logger.log(
        `startBlockNum: ${startBlockNum}, endBlockNum: ${endBlockNum}`,
      );

      await this.sync(startBlockNum, endBlockNum);
      this.currentBlockNumber = endBlockNum;

      startBlockNum = endBlockNum;
      endBlockNum = startBlockNum + this.blockPageSize;
      if (endBlockNum > latestBlockNumber) {
        endBlockNum = latestBlockNumber;
      }
    }
  }

  async run(): Promise<void> {
    const latestBlockNumber = await this.provider.getBlockNumber();
    await this.syncPreviousBlocks(latestBlockNumber);
    await this.contract.on('Transfer', async (from, to, tokenId) => {
      this.logger.log(`New Transfer: ${from} to ${to}, tokenId: ${tokenId}`);
      const blockNumber = await this.provider.getBlockNumber();
      await this.syncPreviousBlocks(blockNumber);
    });

    while (true) {
      this.logger.log('##### Listening to Transfer events. #####');
      await sleep(10000);
    }
  }
}
