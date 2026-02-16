import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../invoice/entity/invoice.entity';
import { InvoiceItem } from '../invoice/entity/invoice-item.entity';
import { ProductVariant } from '../product/entities/product-variant.entity';
import { Customer } from '../customer/entity/customer.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async getKpis() {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Sales today
    const salesToday = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('COALESCE(SUM(invoice.total), 0)', 'total')
      .where('invoice.createdAt >= :startOfDay', { startOfDay })
      .getRawOne();

    // Sales this month
    const salesThisMonth = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('COALESCE(SUM(invoice.total), 0)', 'total')
      .select('COALESCE(COUNT(invoice.id), 0)', 'count')
      .addSelect('COALESCE(SUM(invoice.total), 0)', 'total')
      .where('invoice.createdAt >= :startOfMonth', { startOfMonth })
      .getRawOne();

    // Profit this month
    const profitThisMonth = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('COALESCE(SUM(invoice.totalProfit), 0)', 'profit')
      .where('invoice.createdAt >= :startOfMonth', { startOfMonth })
      .getRawOne();

    // Average ticket this month
    const avgTicket =
      Number(salesThisMonth.count) > 0
        ? Number(salesThisMonth.total) / Number(salesThisMonth.count)
        : 0;

    // Top product (most sold by quantity)
    const topProduct = await this.invoiceItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.productVariant', 'variant')
      .leftJoin('variant.product', 'product')
      .select('product.name', 'name')
      .addSelect('SUM(item.quantity)', 'totalSold')
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('"totalSold"', 'DESC')
      .limit(1)
      .getRawOne();

    // Low stock count
    const lowStockCount = await this.variantRepository
      .createQueryBuilder('variant')
      .where('variant.stock <= variant.minStock')
      .getCount();

    // New customers this month
    const newCustomersThisMonth = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.createdAt >= :startOfMonth', { startOfMonth })
      .getCount();

    return {
      salesToday: Math.round(Number(salesToday.total) * 100) / 100,
      salesThisMonth: Math.round(Number(salesThisMonth.total) * 100) / 100,
      salesCountThisMonth: Number(salesThisMonth.count),
      profitThisMonth: Math.round(Number(profitThisMonth.profit) * 100) / 100,
      averageTicket: Math.round(avgTicket * 100) / 100,
      topProduct: topProduct
        ? {
            name: topProduct.name,
            totalSold: Number(topProduct.totalSold),
          }
        : null,
      lowStockCount,
      newCustomersThisMonth,
    };
  }

  async getSalesByMonth() {
    const result = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select("TO_CHAR(invoice.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COALESCE(SUM(invoice.total), 0)', 'total')
      .addSelect('COUNT(invoice.id)', 'count')
      .where("invoice.createdAt >= NOW() - INTERVAL '12 months'")
      .groupBy("TO_CHAR(invoice.createdAt, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();

    return result.map((r) => ({
      month: r.month,
      total: Math.round(Number(r.total) * 100) / 100,
      count: Number(r.count),
    }));
  }

  async getProfitByMonth() {
    const result = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select("TO_CHAR(invoice.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COALESCE(SUM(invoice.totalProfit), 0)', 'profit')
      .addSelect('COALESCE(SUM(invoice.total), 0)', 'revenue')
      .addSelect('COALESCE(SUM(invoice.totalCost), 0)', 'cost')
      .where("invoice.createdAt >= NOW() - INTERVAL '12 months'")
      .groupBy("TO_CHAR(invoice.createdAt, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();

    return result.map((r) => ({
      month: r.month,
      revenue: Math.round(Number(r.revenue) * 100) / 100,
      cost: Math.round(Number(r.cost) * 100) / 100,
      profit: Math.round(Number(r.profit) * 100) / 100,
    }));
  }

  async getTopProducts(limit: number = 5) {
    const result = await this.invoiceItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.productVariant', 'variant')
      .leftJoin('variant.product', 'product')
      .select('product.id', 'id')
      .addSelect('product.name', 'name')
      .addSelect('SUM(item.quantity)', 'totalSold')
      .addSelect('SUM(item.quantity * item.priceAtSale)', 'totalRevenue')
      .addSelect(
        'SUM(item.quantity * (item.priceAtSale - item.costAtSale))',
        'totalProfit',
      )
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('"totalSold"', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map((r) => ({
      id: r.id,
      name: r.name,
      totalSold: Number(r.totalSold),
      totalRevenue: Math.round(Number(r.totalRevenue) * 100) / 100,
      totalProfit: Math.round(Number(r.totalProfit) * 100) / 100,
    }));
  }
}
