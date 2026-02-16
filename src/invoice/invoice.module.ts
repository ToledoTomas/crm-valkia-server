import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entity/invoice.entity';
import { InvoiceItem } from './entity/invoice-item.entity';
import { ProductVariant } from '../product/entities/product-variant.entity';
import { StockMovement } from '../stock/entity/stock-movement.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceItem,
      ProductVariant,
      StockMovement,
    ]),
    AuthModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
