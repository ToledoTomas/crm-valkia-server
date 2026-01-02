import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Invoice } from '../../invoice/entity/invoice.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 0 })
  cost: number;

  @Column()
  price: number;

  @Column()
  description: string;

  @Column('jsonb', { nullable: true })
  color: string[];

  @Column('jsonb', { nullable: true })
  size: string[];

  @Column()
  stock: number;

  @ManyToMany(() => Invoice, (invoice) => invoice.products)
  invoices: Invoice[];
}
