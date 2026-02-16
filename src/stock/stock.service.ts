import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  EntityManager,
  LessThanOrEqual,
} from 'typeorm';
import { ProductVariant } from '../product/entities/product-variant.entity';
import {
  StockMovement,
  StockMovementType,
} from './entity/stock-movement.entity';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(StockMovement)
    private readonly movementRepository: Repository<StockMovement>,
    private readonly dataSource: DataSource,
  ) {}

  async findAllStock(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.variantRepository.findAndCount({
      skip,
      take: limit,
      relations: ['product'],
      order: { stock: 'ASC' },
    });

    return {
      data: data.map((v) => ({
        id: v.id,
        productName: v.product.name,
        color: v.color,
        size: v.size,
        stock: v.stock,
        minStock: v.minStock,
        isLow: v.stock <= v.minStock,
      })),
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findLowStock(): Promise<any[]> {
    const variants = await this.variantRepository
      .createQueryBuilder('variant')
      .leftJoinAndSelect('variant.product', 'product')
      .where('variant.stock <= variant.minStock')
      .orderBy('variant.stock', 'ASC')
      .getMany();

    return variants.map((v) => ({
      id: v.id,
      productName: v.product.name,
      color: v.color,
      size: v.size,
      stock: v.stock,
      minStock: v.minStock,
    }));
  }

  async getMovements(variantId: number): Promise<StockMovement[]> {
    const variant = await this.variantRepository.findOneBy({ id: variantId });
    if (!variant) {
      throw new NotFoundException(`Variante con id ${variantId} no encontrada`);
    }

    return this.movementRepository.find({
      where: { productVariantId: variantId },
      order: { createdAt: 'DESC' },
    });
  }

  async adjustStock(dto: CreateStockAdjustmentDto) {
    return await this.dataSource.manager.transaction(
      async (manager: EntityManager) => {
        const variant = await manager.findOne(ProductVariant, {
          where: { id: dto.productVariantId },
          lock: { mode: 'pessimistic_write' },
          relations: ['product'],
        });

        if (!variant) {
          throw new NotFoundException(
            `Variante con id ${dto.productVariantId} no encontrada`,
          );
        }

        variant.stock += dto.quantity;
        if (variant.stock < 0) {
          variant.stock = 0;
        }
        await manager.save(ProductVariant, variant);

        const movement = manager.create(StockMovement, {
          productVariantId: variant.id,
          type: StockMovementType.MANUAL_ADJUSTMENT,
          quantity: dto.quantity,
          reason: dto.reason,
        });
        await manager.save(StockMovement, movement);

        return {
          variant: {
            id: variant.id,
            productName: variant.product.name,
            color: variant.color,
            size: variant.size,
            stock: variant.stock,
          },
          movement,
        };
      },
    );
  }
}
