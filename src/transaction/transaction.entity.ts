import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
export enum TransactionType {
  MINT = 'MINT',
  TRANSFER = 'TRANSFER',
  BURN = 'BURN',
}

@Entity('nft_transactions')
@Index(
  ['transferFrom', 'transferTo', 'tokenID', 'blockNumber', 'transactionType'],
  { unique: true },
)
export class Transaction {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'contract_address', type: 'varchar', length: 42 })
  contractAddress: string;

  @Column({ name: 'transfer_from', type: 'varchar', length: 42 })
  transferFrom: string;

  @Column({ name: 'transfer_to', type: 'varchar', length: 42 })
  transferTo: string;

  @Column({ name: 'token_id', type: 'bigint' })
  tokenID: number;

  @Column({ name: 'block_number', type: 'bigint' })
  blockNumber: number;

  @Column({
    name: 'transaction_type',
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.MINT,
  })
  transactionType: string;

  @Column({
    name: 'transferred_at',
    type: 'timestamp with time zone',
  })
  transferredAt: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
