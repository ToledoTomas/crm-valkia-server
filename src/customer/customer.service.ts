import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, FindManyOptions } from 'typeorm';
import { Customer } from './entity/customer.entity';
import { SearchCustomerDto } from './dto/search-customer.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

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

  async getCustomers(
    paginationDto: PaginationDto,
    searchTerm?: string,
  ): Promise<PaginatedResult<Customer>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const queryOptions: FindManyOptions<Customer> = {
      skip,
      take: limit,
    };

    if (searchTerm) {
      queryOptions.where = {
        fullname: Like(`%${searchTerm}%`),
      };
    }

    const [data, total] =
      await this.customerRepository.findAndCount(queryOptions);

    return {
      data,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async deleteCustomer(id: string) {
    const result = await this.customerRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Customer with id: ${id} not found`);
    }
    return {
      status: HttpStatus.OK,
      message: `Customer with id: ${id} deleted successfully`,
    };
  }

  async getCustomer(id: number) {
    return this.customerRepository.findOneBy({ id });
  }

  async findByFullname(dto: SearchCustomerDto) {
    const { fullname } = dto;
    const query = this.customerRepository.createQueryBuilder('customer');
    if (fullname) {
      query.andWhere('customer.fullname ILIKE :fullname', {
        fullname: `%${fullname}%`,
      });
    }
    return query.getMany();
  }

  async updateCustomer(id: number, customerDto: CreateCustomerDto) {
    const customer = await this.customerRepository.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`Customer with id: ${id} not found`);
    }
    return this.customerRepository.update(id, customerDto);
  }
}
