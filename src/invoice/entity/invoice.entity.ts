import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinTable,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Customer } from '../../customer/entity/customer.entity';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.invoices)
  customer: Customer;

  @ManyToMany(() => Product, (product) => product.invoices)
  @JoinTable()
  products: Product[];

  @Column()
  total: number;

  @Column({ default: 'PENDING' })
  status: string;

  @Column()
  created_at: Date;
}
