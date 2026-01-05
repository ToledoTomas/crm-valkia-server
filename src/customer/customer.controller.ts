import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { AuthGuard } from '../auth/auth.guard';

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
  async getCustomers() {
    return this.customerService.getCustomers();
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteCustomer(@Param('id') id: number) {
    return this.customerService.deleteCustomer(id.toString());
  }
}
