import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  DeleteDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Invoice } from '../../invoice/entity/invoice.entity';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  instagram: string;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @OneToMany(() => Invoice, (invoice) => invoice.customer)
  invoices: Invoice[];

  @DeleteDateColumn()
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
