import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createInvoice(@Body() invoiceDto: CreateInvoiceDto) {
    return this.invoiceService.createInvoice(invoiceDto);
  }
  @Get()
  @UseGuards(AuthGuard)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.invoiceService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(+id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.invoiceService.remove(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  updateStatus(@Param('id') id: string, @Body() status: string) {
    return this.invoiceService.updateStatus(+id, status);
  }
}
