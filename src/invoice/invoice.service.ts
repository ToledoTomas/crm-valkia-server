import { Injectable } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from './entity/invoice.entity';
import { Repository } from 'typeorm';
import { Customer } from '../customer/entity/customer.entity';
import { Product } from '../product/entities/product.entity';

import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createInvoice(invoiceDto: CreateInvoiceDto) {
    const customer = await this.customerRepository.findOneBy({
      id: invoiceDto.customer,
    });
    if (!customer) {
      throw new Error('Customer not found');
    }

    const products: Product[] = [];
    let total = 0;

    for (const productId of invoiceDto.products) {
      const product = await this.productRepository.findOneBy({ id: productId });
      if (!product) {
        throw new Error(`Product with id ${productId} not found`);
      }
      if (product.stock <= 0) {
        throw new Error(`Product ${product.name} has no available stock`);
      }
      products.push(product);
      total += product.price;
    }

    const invoice = this.invoiceRepository.create({
      customer: customer,
      products: products,
      total: total,
      status: invoiceDto.status,
      created_at: new Date(),
    });
    return this.invoiceRepository.save(invoice);
  }
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Invoice>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.invoiceRepository.findAndCount({
      skip,
      take: limit,
      relations: {
        customer: true,
        products: true,
      },
    });

    return {
      data,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    return this.invoiceRepository.findOne({
      where: { id },
      relations: {
        customer: true,
        products: true,
      },
    });
  }

  async remove(id: number) {
    return this.invoiceRepository.delete(id);
  }

  async updateStatus(id: number, status: string) {
    return this.invoiceRepository.update(id, { status });
  }
}
