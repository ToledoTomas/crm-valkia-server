import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

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
}
