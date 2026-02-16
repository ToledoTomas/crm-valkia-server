import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Invoice } from '../invoice/entity/invoice.entity';
import { InvoiceItem } from '../invoice/entity/invoice-item.entity';
import { ProductVariant } from '../product/entities/product-variant.entity';
import { Customer } from '../customer/entity/customer.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem, ProductVariant, Customer]),
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
