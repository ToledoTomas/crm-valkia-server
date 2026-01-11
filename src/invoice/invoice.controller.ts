import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AuthGuard } from '../auth/auth.guard';

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
  findAll() {
    return this.invoiceService.findAll();
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
}
