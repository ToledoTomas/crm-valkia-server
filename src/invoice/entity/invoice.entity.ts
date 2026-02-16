import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../customer/entity/customer.entity';
import { InvoiceItem } from './invoice-item.entity';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  customerId: number;

  @ManyToOne(() => Customer, (customer) => customer.invoices, {
    nullable: true,
  })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalCost: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalProfit: number;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, {
    cascade: true,
    eager: true,
  })
  items: InvoiceItem[];

  @CreateDateColumn()
  createdAt: Date;
}
