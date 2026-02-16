import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { InvoiceItem } from '../../invoice/entity/invoice-item.entity';
import { StockMovement } from '../../stock/entity/stock-movement.entity';

@Entity()
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  color: string;

  @Column()
  size: string;

  @Column('decimal', { precision: 10, scale: 2 })
  cost: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: 0 })
  minStock: number;

  @OneToMany(() => InvoiceItem, (item) => item.productVariant)
  invoiceItems: InvoiceItem[];

  @OneToMany(() => StockMovement, (movement) => movement.productVariant)
  stockMovements: StockMovement[];
}
