import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product/entities/product.entity';
import { ProductController } from './product/product.controller';
import { ProductService } from './product/product.service';
import { UserModule } from './user/user.module';
import { InvoiceModule } from './invoice/invoice.module';
import { CustomerModule } from './customer/customer.module';
import { AuthModule } from './auth/auth.module';
import { User } from './user/entity/user.entity';
import { Invoice } from './invoice/entity/invoice.entity';
import { Customer } from './customer/entity/customer.entity';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Product, User, Invoice, Customer],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Product]),
    UserModule,
    InvoiceModule,
    CustomerModule,
    AuthModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class AppModule {}
