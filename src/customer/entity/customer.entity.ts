import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { Invoice } from '../../invoice/entity/invoice.entity';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullname: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @OneToMany(() => Invoice, (invoice) => invoice.customer)
  invoices: Invoice[];

  @DeleteDateColumn()
  deletedAt: Date;
}
