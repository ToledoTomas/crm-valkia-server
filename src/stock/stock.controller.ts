import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('stock')
@UseGuards(AuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  findAllStock(@Query() paginationDto: PaginationDto) {
    return this.stockService.findAllStock(paginationDto);
  }

  @Get('low')
  findLowStock() {
    return this.stockService.findLowStock();
  }

  @Get('movements/:variantId')
  getMovements(@Param('variantId', ParseIntPipe) variantId: number) {
    return this.stockService.getMovements(variantId);
  }

  @Post('adjust')
  adjustStock(@Body() dto: CreateStockAdjustmentDto) {
    return this.stockService.adjustStock(dto);
  }
}
