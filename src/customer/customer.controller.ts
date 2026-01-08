import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { AuthGuard } from '../auth/auth.guard';
import { SearchCustomerDto } from './dto/search-customer.dto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createCustomer(@Body() customerDto: CreateCustomerDto) {
    return this.customerService.createCustomer(customerDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getCustomers(@Query('search') searchTerm?: string) {
    return this.customerService.getCustomers(searchTerm);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteCustomer(@Param('id') id: number) {
    return this.customerService.deleteCustomer(id.toString());
  }

  @Get('search')
  @UseGuards(AuthGuard)
  async findByFullname(@Query() dto: SearchCustomerDto) {
    return this.customerService.findByFullname(dto);
  }
}
