import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ProductVariant } from '../../product/entities/product-variant.entity';

export enum StockMovementType {
  SALE = 'SALE',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
}

@Entity()
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productVariantId: number;

  @ManyToOne(() => ProductVariant, (variant) => variant.stockMovements)
  @JoinColumn({ name: 'productVariantId' })
  productVariant: ProductVariant;

  @Column({
    type: 'enum',
    enum: StockMovementType,
  })
  type: StockMovementType;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
