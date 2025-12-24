import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Invoice } from '../../invoice/entity/invoice.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
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

  @ManyToOne(() => Invoice, (invoice) => invoice.products)
  invoice: Invoice;
}
