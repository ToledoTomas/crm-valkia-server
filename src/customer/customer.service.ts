import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, FindManyOptions } from 'typeorm';
import { Customer } from './entity/customer.entity';
import { SearchCustomerDto } from './dto/search-customer.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

export enum CustomerClassification {
  NUEVO = 'NUEVO',
  RECURRENTE = 'RECURRENTE',
  VIP = 'VIP',
  INACTIVO = 'INACTIVO',
}

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
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const queryOptions: FindManyOptions<Customer> = {
      skip,
      take: limit,
      relations: ['invoices'],
      order: { createdAt: 'DESC' },
    };

    if (searchTerm) {
      queryOptions.where = {
        name: Like(`%${searchTerm}%`),
      };
    }

    const [data, total] =
      await this.customerRepository.findAndCount(queryOptions);

    const enrichedData = data.map((customer) => this.enrichCustomer(customer));

    return {
      data: enrichedData,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async getCustomer(id: number) {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['invoices'],
    });
    if (!customer) {
      throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    }
    return this.enrichCustomer(customer);
  }

  async deleteCustomer(id: number) {
    const result = await this.customerRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    }
    return {
      status: HttpStatus.OK,
      message: `Cliente con id ${id} eliminado correctamente`,
    };
  }

  async findByName(dto: SearchCustomerDto) {
    const { name } = dto;
    const query = this.customerRepository.createQueryBuilder('customer');
    query.leftJoinAndSelect('customer.invoices', 'invoice');
    if (name) {
      query.andWhere('customer.name ILIKE :name', {
        name: `%${name}%`,
      });
    }
    const customers = await query.getMany();
    return customers.map((c) => this.enrichCustomer(c));
  }

  async updateCustomer(id: number, customerDto: UpdateCustomerDto) {
    const customer = await this.customerRepository.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    }
    Object.assign(customer, customerDto);
    return this.customerRepository.save(customer);
  }

  // --- Helpers ---

  private enrichCustomer(customer: Customer): any {
    const invoices = customer.invoices || [];
    const totalSpent = invoices.reduce(
      (sum, inv) => sum + Number(inv.total),
      0,
    );
    const lastPurchase =
      invoices.length > 0
        ? invoices.reduce((latest, inv) =>
            new Date(inv.createdAt) > new Date(latest.createdAt) ? inv : latest,
          ).createdAt
        : null;

    const orderCount = invoices.length;
    const daysSinceLastPurchase = lastPurchase
      ? Math.floor(
          (Date.now() - new Date(lastPurchase).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null;

    let classification: CustomerClassification;
    if (daysSinceLastPurchase !== null && daysSinceLastPurchase > 90) {
      classification = CustomerClassification.INACTIVO;
    } else if (orderCount >= 6) {
      classification = CustomerClassification.VIP;
    } else if (orderCount >= 2) {
      classification = CustomerClassification.RECURRENTE;
    } else {
      classification = CustomerClassification.NUEVO;
    }

    const { invoices: _, ...customerData } = customer;

    return {
      ...customerData,
      totalSpent: Math.round(totalSpent * 100) / 100,
      lastPurchase,
      orderCount,
      classification,
    };
  }
}
