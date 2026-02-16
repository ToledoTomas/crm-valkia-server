import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Invoice } from '../invoice/entity/invoice.entity';
import { InvoiceItem } from '../invoice/entity/invoice-item.entity';
import { Customer } from '../customer/entity/customer.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem, Customer]),
    AuthModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
