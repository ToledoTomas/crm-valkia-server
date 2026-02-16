import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../invoice/entity/invoice.entity';
import { InvoiceItem } from '../invoice/entity/invoice-item.entity';
import { Customer } from '../customer/entity/customer.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async getProfitabilityByProduct() {
    const result = await this.invoiceItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.productVariant', 'variant')
      .leftJoin('variant.product', 'product')
      .select('product.id', 'id')
      .addSelect('product.name', 'name')
      .addSelect('product.category', 'category')
      .addSelect('SUM(item.quantity)', 'totalSold')
      .addSelect('SUM(item.quantity * item.priceAtSale)', 'totalRevenue')
      .addSelect('SUM(item.quantity * item.costAtSale)', 'totalCost')
      .addSelect(
        'SUM(item.quantity * (item.priceAtSale - item.costAtSale))',
        'totalProfit',
      )
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('product.category')
      .orderBy('"totalProfit"', 'DESC')
      .getRawMany();

    return result.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      totalSold: Number(r.totalSold),
      totalRevenue: Math.round(Number(r.totalRevenue) * 100) / 100,
      totalCost: Math.round(Number(r.totalCost) * 100) / 100,
      totalProfit: Math.round(Number(r.totalProfit) * 100) / 100,
      margin:
        Number(r.totalRevenue) > 0
          ? Math.round(
              (Number(r.totalProfit) / Number(r.totalRevenue)) * 10000,
            ) / 100
          : 0,
    }));
  }

  async getProfitabilityByCategory() {
    const result = await this.invoiceItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.productVariant', 'variant')
      .leftJoin('variant.product', 'product')
      .select('product.category', 'category')
      .addSelect('SUM(item.quantity)', 'totalSold')
      .addSelect('SUM(item.quantity * item.priceAtSale)', 'totalRevenue')
      .addSelect('SUM(item.quantity * item.costAtSale)', 'totalCost')
      .addSelect(
        'SUM(item.quantity * (item.priceAtSale - item.costAtSale))',
        'totalProfit',
      )
      .groupBy('product.category')
      .orderBy('"totalProfit"', 'DESC')
      .getRawMany();

    return result.map((r) => ({
      category: r.category,
      totalSold: Number(r.totalSold),
      totalRevenue: Math.round(Number(r.totalRevenue) * 100) / 100,
      totalCost: Math.round(Number(r.totalCost) * 100) / 100,
      totalProfit: Math.round(Number(r.totalProfit) * 100) / 100,
      margin:
        Number(r.totalRevenue) > 0
          ? Math.round(
              (Number(r.totalProfit) / Number(r.totalRevenue)) * 10000,
            ) / 100
          : 0,
    }));
  }

  async getProductsWithNoRotation(days: number = 30) {
    const result = await this.invoiceItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.productVariant', 'variant')
      .leftJoin('variant.product', 'product')
      .select('product.id', 'id')
      .addSelect('product.name', 'name')
      .addSelect('product.category', 'category')
      .addSelect('MAX(item.invoice)', 'lastInvoiceId')
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('product.category')
      .getRawMany();

    // Get products that either have no sales or last sale was > N days ago
    const productsNoRotation = await this.invoiceItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.invoice', 'invoice')
      .leftJoin('item.productVariant', 'variant')
      .leftJoin('variant.product', 'product')
      .select('product.id', 'id')
      .addSelect('product.name', 'name')
      .addSelect('product.category', 'category')
      .addSelect('MAX(invoice.createdAt)', 'lastSaleDate')
      .addSelect('SUM(variant.stock)', 'currentStock')
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('product.category')
      .having(`MAX(invoice.createdAt) < NOW() - INTERVAL '${days} days'`)
      .orderBy('"lastSaleDate"', 'ASC')
      .getRawMany();

    // Also get products that were never sold but have stock
    const neverSold = await this.invoiceItemRepository.manager
      .createQueryBuilder()
      .select('product.id', 'id')
      .addSelect('product.name', 'name')
      .addSelect('product.category', 'category')
      .addSelect('COALESCE(SUM(variant.stock), 0)', 'currentStock')
      .from('product', 'product')
      .leftJoin('product_variant', 'variant', 'variant.productId = product.id')
      .leftJoin('invoice_item', 'item', 'item.productVariantId = variant.id')
      .where('item.id IS NULL')
      .andWhere('product.active = true')
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('product.category')
      .getRawMany();

    return [
      ...neverSold.map((p) => ({
        ...p,
        currentStock: Number(p.currentStock),
        lastSaleDate: null,
        daysSinceLastSale: null,
        neverSold: true,
      })),
      ...productsNoRotation.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        currentStock: Number(p.currentStock),
        lastSaleDate: p.lastSaleDate,
        daysSinceLastSale: Math.floor(
          (Date.now() - new Date(p.lastSaleDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
        neverSold: false,
      })),
    ];
  }

  async getTopSpenders(limit: number = 10) {
    const result = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoin('invoice.customer', 'customer')
      .select('customer.id', 'id')
      .addSelect('customer.name', 'name')
      .addSelect('customer.phone', 'phone')
      .addSelect('customer.instagram', 'instagram')
      .addSelect('SUM(invoice.total)', 'totalSpent')
      .addSelect('COUNT(invoice.id)', 'orderCount')
      .addSelect('AVG(invoice.total)', 'avgTicket')
      .where('invoice.customerId IS NOT NULL')
      .groupBy('customer.id')
      .addGroupBy('customer.name')
      .addGroupBy('customer.phone')
      .addGroupBy('customer.instagram')
      .orderBy('"totalSpent"', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      instagram: r.instagram,
      totalSpent: Math.round(Number(r.totalSpent) * 100) / 100,
      orderCount: Number(r.orderCount),
      avgTicket: Math.round(Number(r.avgTicket) * 100) / 100,
    }));
  }

  async getSalesByDateRange(from: string, to: string) {
    const query = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.customer', 'customer')
      .leftJoinAndSelect('invoice.items', 'item')
      .leftJoinAndSelect('item.productVariant', 'variant')
      .leftJoinAndSelect('variant.product', 'product');

    if (from) {
      query.andWhere('invoice.createdAt >= :from', { from });
    }
    if (to) {
      query.andWhere('invoice.createdAt <= :to', { to });
    }

    query.orderBy('invoice.createdAt', 'DESC');

    const invoices = await query.getMany();

    const totalRevenue = invoices.reduce(
      (sum, inv) => sum + Number(inv.total),
      0,
    );
    const totalCost = invoices.reduce(
      (sum, inv) => sum + Number(inv.totalCost),
      0,
    );
    const totalProfit = invoices.reduce(
      (sum, inv) => sum + Number(inv.totalProfit),
      0,
    );

    return {
      summary: {
        count: invoices.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
        avgTicket:
          invoices.length > 0
            ? Math.round((totalRevenue / invoices.length) * 100) / 100
            : 0,
      },
      invoices,
    };
  }
}
