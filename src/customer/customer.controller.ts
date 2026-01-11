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
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { AuthGuard } from '../auth/auth.guard';
import { SearchCustomerDto } from './dto/search-customer.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

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
  async getCustomers(
    @Query() paginationDto: PaginationDto,
    @Query('search') searchTerm?: string,
  ) {
    return this.customerService.getCustomers(paginationDto, searchTerm);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getCustomer(@Param('id') id: number) {
    return this.customerService.getCustomer(id);
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

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateCustomer(
    @Param('id') id: number,
    @Body() customerDto: CreateCustomerDto,
  ) {
    return this.customerService.updateCustomer(id, customerDto);
  }
}
