import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Customer } from '../../customer/entity/customer.entity';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Customer, (customer) => customer.invoice)
  customer: Customer;

  @OneToMany(() => Product, (product) => product.invoice)
  products: Product[];

  @Column()
  total: number;

  @Column()
  created_at: Date;
}
