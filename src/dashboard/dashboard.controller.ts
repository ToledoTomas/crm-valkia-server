import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  getKpis() {
    return this.dashboardService.getKpis();
  }

  @Get('sales-by-month')
  getSalesByMonth() {
    return this.dashboardService.getSalesByMonth();
  }

  @Get('profit-by-month')
  getProfitByMonth() {
    return this.dashboardService.getProfitByMonth();
  }

  @Get('top-products')
  getTopProducts(@Query('limit') limit?: string) {
    return this.dashboardService.getTopProducts(
      limit ? parseInt(limit, 10) : 5,
    );
  }
}
