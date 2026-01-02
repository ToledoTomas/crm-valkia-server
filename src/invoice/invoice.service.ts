import { Injectable } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from './entity/invoice.entity';
import { Repository } from 'typeorm';
import { Customer } from '../customer/entity/customer.entity';
import { Product } from '../product/entities/product.entity';

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
    for (const productId of invoiceDto.products) {
      const product = await this.productRepository.findOneBy({ id: productId });
      if (product) {
        products.push(product);
      }
    }

    const invoice = this.invoiceRepository.create({
      ...invoiceDto,
      customer: customer,
      products: products,
      // You might want to calculate total here based on products
    });
    return this.invoiceRepository.save(invoice);
  }
}
