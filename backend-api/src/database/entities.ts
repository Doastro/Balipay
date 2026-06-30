import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum AdminRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  OPS = "OPS",
  SUPPORT = "SUPPORT",
  FINANCE = "FINANCE",
}

export enum MerchantStatus {
  LEAD = "LEAD",
  KYB_PENDING = "KYB_PENDING",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  CLOSED = "CLOSED",
}

export enum TerminalStatus {
  AVAILABLE = "AVAILABLE",
  ASSIGNED = "ASSIGNED",
  ACTIVE = "ACTIVE",
  MAINTENANCE = "MAINTENANCE",
  LOST = "LOST",
}

export enum TransactionStatus {
  CREATED = "CREATED",
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum RefundStatus {
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  PROCESSING = "PROCESSING",
  DONE = "DONE",
  REJECTED = "REJECTED",
}

export enum ClosingStatus {
  DRAFT = "DRAFT",
  VALIDATED = "VALIDATED",
}

@Entity()
export class AdminUser {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column()
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ default: "Admin Balipay" })
  name!: string;

  @Column({ type: "enum", enum: AdminRole, default: AdminRole.SUPER_ADMIN })
  role!: AdminRole;

  @CreateDateColumn()
  createdAt!: Date;
}

@Entity()
export class Merchant {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  legalName!: string;

  @Column()
  displayName!: string;

  @Column({ nullable: true })
  siret?: string;

  @Column({ nullable: true })
  contactName?: string;

  @Column({ nullable: true })
  contactEmail?: string;

  @Column({ nullable: true })
  contactPhone?: string;

  @Column({ nullable: true })
  sector?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ type: "enum", enum: MerchantStatus, default: MerchantStatus.LEAD })
  status!: MerchantStatus;

  @Column({ nullable: true })
  salesOwner?: string;

  @Column({ type: "text", nullable: true })
  internalNotes?: string;

  @OneToMany(() => Store, (store) => store.merchant)
  stores!: Store[];

  @OneToMany(() => MerchantDocument, (document) => document.merchant)
  documents!: MerchantDocument[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity()
export class MerchantDocument {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Merchant, (merchant) => merchant.documents, { onDelete: "CASCADE" })
  merchant!: Merchant;

  @Column()
  type!: string;

  @Column()
  fileName!: string;

  @Column({ default: "PENDING" })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}

@Entity()
export class Store {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Merchant, (merchant) => merchant.stores, { onDelete: "CASCADE" })
  merchant!: Merchant;

  @Column()
  name!: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  postalCode?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  sector?: string;

  @Column({ nullable: true })
  salesOwner?: string;

  @OneToMany(() => Terminal, (terminal) => terminal.store)
  terminals!: Terminal[];
}

@Entity()
export class Terminal {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  serialNumber!: string;

  @Column()
  model!: string;

  @Column({ default: "BALIPAY" })
  provider!: string;

  @Column({ type: "enum", enum: TerminalStatus, default: TerminalStatus.AVAILABLE })
  status!: TerminalStatus;

  @ManyToOne(() => Store, (store) => store.terminals, { nullable: true, onDelete: "SET NULL" })
  store?: Store | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity()
export class PaymentTransaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Merchant, { onDelete: "CASCADE" })
  merchant!: Merchant;

  @ManyToOne(() => Store, { nullable: true, onDelete: "SET NULL" })
  store?: Store | null;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  amount!: string;

  @Column({ default: "EUR" })
  currency!: string;

  @Column()
  paymentMethod!: string;

  @Column({ type: "enum", enum: TransactionStatus, default: TransactionStatus.CREATED })
  status!: TransactionStatus;

  @Column({ default: "BALIPAY_MOCK" })
  provider!: string;

  @Column({ nullable: true })
  externalTransactionId?: string;

  @Column({ nullable: true })
  externalReference?: string;

  @CreateDateColumn()
  createdAt!: Date;
}

@Entity()
export class Refund {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => PaymentTransaction, { onDelete: "CASCADE" })
  transaction!: PaymentTransaction;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  amount!: string;

  @Column({ type: "enum", enum: RefundStatus, default: RefundStatus.REQUESTED })
  status!: RefundStatus;

  @Column({ type: "text", nullable: true })
  reason?: string;

  @CreateDateColumn()
  createdAt!: Date;
}

@Entity()
export class DailyClosing {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Merchant, { onDelete: "CASCADE" })
  merchant!: Merchant;

  @Column({ type: "date" })
  businessDate!: string;

  @Column({ type: "numeric", precision: 12, scale: 2, default: 0 })
  totalSales!: string;

  @Column({ type: "numeric", precision: 12, scale: 2, default: 0 })
  totalPayments!: string;

  @Column({ type: "numeric", precision: 12, scale: 2, default: 0 })
  gapAmount!: string;

  @Column({ type: "enum", enum: ClosingStatus, default: ClosingStatus.DRAFT })
  status!: ClosingStatus;

  @Column({ type: "text", nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt!: Date;
}

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  actorId!: string;

  @Column()
  actorEmail!: string;

  @Column()
  action!: string;

  @Column()
  entityType!: string;

  @Column({ nullable: true })
  entityId?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;
}

export const entities = [
  AdminUser,
  Merchant,
  MerchantDocument,
  Store,
  Terminal,
  PaymentTransaction,
  Refund,
  DailyClosing,
  AuditLog,
];
