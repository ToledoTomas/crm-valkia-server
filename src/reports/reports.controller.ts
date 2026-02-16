import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('reports')
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('profitability/products')
  getProfitabilityByProduct() {
    return this.reportsService.getProfitabilityByProduct();
  }

  @Get('profitability/categories')
  getProfitabilityByCategory() {
    return this.reportsService.getProfitabilityByCategory();
  }

  @Get('products/no-rotation')
  getProductsWithNoRotation(@Query('days') days?: string) {
    return this.reportsService.getProductsWithNoRotation(
      days ? parseInt(days, 10) : 30,
    );
  }

  @Get('customers/top-spenders')
  getTopSpenders(@Query('limit') limit?: string) {
    return this.reportsService.getTopSpenders(limit ? parseInt(limit, 10) : 10);
  }

  @Get('sales')
  getSalesByDateRange(
    @Query('from') from: string = '',
    @Query('to') to: string = '',
  ) {
    return this.reportsService.getSalesByDateRange(from, to);
  }
}
