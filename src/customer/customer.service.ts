import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entity/customer.entity';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async createCustomer(customerDto: CreateCustomerDto) {
    const customer = this.customerRepository.create(customerDto);
    return this.customerRepository.save(customer);
  }

  async getCustomers() {
    return this.customerRepository.find();
  }

  async deleteCustomer(id: string) {
    const deletedCustomer = await this.customerRepository.delete(id);
    if (deletedCustomer.affected === 0) {
      throw new NotFoundException(`Customer with id: ${id} not found`);
    }
    return {
      status: HttpStatus.OK,
      message: `Customer with id: ${id} deleted successfully`,
    };
  }
}
