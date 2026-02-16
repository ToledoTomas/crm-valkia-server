import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Entities
import { Product } from './product/entities/product.entity';
import { ProductVariant } from './product/entities/product-variant.entity';
import { User } from './user/entity/user.entity';
import { Invoice } from './invoice/entity/invoice.entity';
import { InvoiceItem } from './invoice/entity/invoice-item.entity';
import { Customer } from './customer/entity/customer.entity';
import { StockMovement } from './stock/entity/stock-movement.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
  entities: [
    Product,
    ProductVariant,
    User,
    Invoice,
    InvoiceItem,
    Customer,
    StockMovement,
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
