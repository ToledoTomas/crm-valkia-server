import { Column, Entity, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
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

  @OneToOne(() => Invoice, (invoice) => invoice.customer)
  invoice: Invoice;
}
