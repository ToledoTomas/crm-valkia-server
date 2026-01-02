import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entity/invoice.entity';
import { Product } from '../product/entities/product.entity';
import { Customer } from '../customer/entity/customer.entity';
import { AuthModule } from '../auth/auth.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Product, Customer]), AuthModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, JwtService],
})
export class InvoiceModule {}
