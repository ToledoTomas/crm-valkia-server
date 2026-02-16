import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { ProductVariant } from '../../product/entities/product-variant.entity';

@Entity()
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  invoiceId: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column()
  productVariantId: number;

  @ManyToOne(() => ProductVariant, (variant) => variant.invoiceItems)
  @JoinColumn({ name: 'productVariantId' })
  productVariant: ProductVariant;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  priceAtSale: number;

  @Column('decimal', { precision: 10, scale: 2 })
  costAtSale: number;
}
