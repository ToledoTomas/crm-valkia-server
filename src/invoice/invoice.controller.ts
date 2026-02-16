import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('invoice')
@UseGuards(AuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  async createInvoice(@Body() invoiceDto: CreateInvoiceDto) {
    return this.invoiceService.createInvoice(invoiceDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.invoiceService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.remove(id);
  }
}
