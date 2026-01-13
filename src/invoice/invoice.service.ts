import { Injectable } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from './entity/invoice.entity';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Customer } from '../customer/entity/customer.entity';
import { Product } from '../product/entities/product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    private readonly dataSource: DataSource,
  ) {}

  async createInvoice(invoiceDto: CreateInvoiceDto) {
    return await this.dataSource.manager.transaction(
      async (manager: EntityManager) => {
        const customer = await manager.findOneBy(Customer, {
          id: invoiceDto.customer,
        });

        if (!customer) {
          throw new Error('Cliente no encontrado');
        }

        const products: Product[] = [];
        let total = 0;

        // Sort product IDs to prevent deadlocks when locking multiple rows
        const sortedProductIds = [...invoiceDto.products].sort((a, b) => a - b);

        for (const productId of sortedProductIds) {
          // Use pessimistic_write lock to prevent race conditions
          const product = await manager.findOne(Product, {
            where: { id: productId },
            lock: { mode: 'pessimistic_write' },
          });

          if (!product) {
            throw new Error(`Producto con id ${productId} no encontrado`);
          }

          if (product.stock <= 0) {
            throw new Error(`Producto ${product.name} sin stock disponible`);
          }

          product.stock -= 1;
          await manager.save(product);
          products.push(product);
          total += product.price;
        }

        const invoice = manager.create(Invoice, {
          customer: customer,
          products: products,
          total: total,
          status: invoiceDto.status,
          created_at: new Date(),
        });

        return manager.save(invoice);
      },
    );
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
