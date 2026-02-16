import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from './entity/invoice.entity';
import { InvoiceItem } from './entity/invoice-item.entity';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Customer } from '../customer/entity/customer.entity';
import { ProductVariant } from '../product/entities/product-variant.entity';
import {
  StockMovement,
  StockMovementType,
} from '../stock/entity/stock-movement.entity';
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
        // Validate customer if provided
        let customer: Customer | null = null;
        if (invoiceDto.customerId) {
          customer = await manager.findOneBy(Customer, {
            id: invoiceDto.customerId,
          });
          if (!customer) {
            throw new NotFoundException(
              `Cliente con id ${invoiceDto.customerId} no encontrado`,
            );
          }
        }

        let total = 0;
        let totalCost = 0;
        const invoiceItems: Partial<InvoiceItem>[] = [];

        // Sort variant IDs to prevent deadlocks
        const sortedItems = [...invoiceDto.items].sort(
          (a, b) => a.productVariantId - b.productVariantId,
        );

        for (const item of sortedItems) {
          // Lock variant row for update
          const variant = await manager.findOne(ProductVariant, {
            where: { id: item.productVariantId },
            lock: { mode: 'pessimistic_write' },
            relations: ['product'],
          });

          if (!variant) {
            throw new NotFoundException(
              `Variante con id ${item.productVariantId} no encontrada`,
            );
          }

          if (variant.stock < item.quantity) {
            throw new BadRequestException(
              `Stock insuficiente para "${variant.product.name}" (${variant.color}/${variant.size}). ` +
                `Disponible: ${variant.stock}, solicitado: ${item.quantity}`,
            );
          }

          // Snapshot prices at time of sale
          const priceAtSale = Number(variant.price);
          const costAtSale = Number(variant.cost);

          // Deduct stock
          variant.stock -= item.quantity;
          await manager.save(ProductVariant, variant);

          // Create stock movement
          await manager.save(StockMovement, {
            productVariantId: variant.id,
            type: StockMovementType.SALE,
            quantity: -item.quantity,
            reason: undefined,
          });

          // Prepare invoice item
          invoiceItems.push({
            productVariantId: variant.id,
            quantity: item.quantity,
            priceAtSale,
            costAtSale,
          });

          total += priceAtSale * item.quantity;
          totalCost += costAtSale * item.quantity;
        }

        const totalProfit = total - totalCost;

        // Create and save invoice with items
        const invoice = manager.create(Invoice, {
          customerId: customer?.id ?? undefined,
          total: Math.round(total * 100) / 100,
          totalCost: Math.round(totalCost * 100) / 100,
          totalProfit: Math.round(totalProfit * 100) / 100,
          items: invoiceItems as InvoiceItem[],
        });

        return manager.save(Invoice, invoice);
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
        items: {
          productVariant: {
            product: true,
          },
        },
      },
      order: { createdAt: 'DESC' },
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
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: {
        customer: true,
        items: {
          productVariant: {
            product: true,
          },
        },
      },
    });
    if (!invoice) {
      throw new NotFoundException(`Venta con id ${id} no encontrada`);
    }
    return invoice;
  }

  async remove(id: number) {
    return await this.dataSource.manager.transaction(
      async (manager: EntityManager) => {
        const invoice = await manager.findOne(Invoice, {
          where: { id },
          relations: ['items', 'items.productVariant'],
        });

        if (!invoice) {
          throw new NotFoundException(`Venta con id ${id} no encontrada`);
        }

        // Revert stock for each item
        for (const item of invoice.items) {
          const variant = await manager.findOne(ProductVariant, {
            where: { id: item.productVariantId },
            lock: { mode: 'pessimistic_write' },
          });

          if (variant) {
            variant.stock += item.quantity;
            await manager.save(ProductVariant, variant);

            // Create reversal stock movement
            await manager.save(StockMovement, {
              productVariantId: variant.id,
              type: StockMovementType.MANUAL_ADJUSTMENT,
              quantity: item.quantity,
              reason: `Reversión de venta #${invoice.id}`,
            });
          }
        }

        await manager.remove(Invoice, invoice);

        return {
          status: HttpStatus.OK,
          message: `Venta con id ${id} eliminada y stock revertido`,
        };
      },
    );
  }
}
