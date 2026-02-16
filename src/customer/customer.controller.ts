import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuthGuard } from '../auth/auth.guard';
import { SearchCustomerDto } from './dto/search-customer.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('customer')
@UseGuards(AuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async createCustomer(@Body() customerDto: CreateCustomerDto) {
    return this.customerService.createCustomer(customerDto);
  }

  @Get()
  async getCustomers(
    @Query() paginationDto: PaginationDto,
    @Query('search') searchTerm?: string,
  ) {
    return this.customerService.getCustomers(paginationDto, searchTerm);
  }

  @Get('search')
  async findByName(@Query() dto: SearchCustomerDto) {
    return this.customerService.findByName(dto);
  }

  @Get(':id')
  async getCustomer(@Param('id', ParseIntPipe) id: number) {
    return this.customerService.getCustomer(id);
  }

  @Patch(':id')
  async updateCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Body() customerDto: UpdateCustomerDto,
  ) {
    return this.customerService.updateCustomer(id, customerDto);
  }

  @Delete(':id')
  async deleteCustomer(@Param('id', ParseIntPipe) id: number) {
    return this.customerService.deleteCustomer(id);
  }
}
