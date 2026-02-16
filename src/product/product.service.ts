import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Like, Repository, FindManyOptions } from 'typeorm';
import { SearchProductDto } from './dto/search-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { variants, ...productData } = createProductDto;

    const product = this.productRepository.create(productData);

    if (variants && variants.length > 0) {
      this.validateUniqueVariants(variants);
      product.variants = variants.map((v) => this.variantRepository.create(v));
    }

    return this.productRepository.save(product);
  }

  async findAll(
    paginationDto: PaginationDto,
    searchTerm?: string,
  ): Promise<PaginatedResult<Product>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const queryOptions: FindManyOptions<Product> = {
      skip,
      take: limit,
      relations: ['variants'],
      order: { createdAt: 'DESC' },
    };

    if (searchTerm) {
      queryOptions.where = {
        name: Like(`%${searchTerm}%`),
      };
    }

    const [data, total] =
      await this.productRepository.findAndCount(queryOptions);

    const enrichedData = data.map((product) => this.enrichProduct(product));

    return {
      data: enrichedData,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['variants'],
    });
    if (!product) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    return this.enrichProduct(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { variants, ...productData } = updateProductDto;

    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['variants'],
    });
    if (!product) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    Object.assign(product, productData);
    return this.productRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['variants'],
    });
    if (!product) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    await this.productRepository.remove(product);
    return {
      status: HttpStatus.OK,
      message: `Producto con id ${id} eliminado correctamente`,
    };
  }

  async findByName(dto: SearchProductDto): Promise<Product[]> {
    const { name } = dto;
    const query = this.productRepository.createQueryBuilder('product');
    query.leftJoinAndSelect('product.variants', 'variant');
    if (name) {
      query.andWhere('product.name ILIKE :name', { name: `%${name}%` });
    }
    const products = await query.getMany();
    return products.map((product) => this.enrichProduct(product));
  }

  // --- Variant operations ---

  async addVariant(productId: number, dto: CreateProductVariantDto) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['variants'],
    });
    if (!product) {
      throw new NotFoundException(`Producto con id ${productId} no encontrado`);
    }

    const duplicate = product.variants.find(
      (v) =>
        v.color.toLowerCase() === dto.color.toLowerCase() &&
        v.size.toLowerCase() === dto.size.toLowerCase(),
    );
    if (duplicate) {
      throw new BadRequestException(
        `Ya existe una variante con color "${dto.color}" y talle "${dto.size}"`,
      );
    }

    const variant = this.variantRepository.create({
      ...dto,
      productId,
    });
    return this.variantRepository.save(variant);
  }

  async updateVariant(variantId: number, dto: UpdateProductVariantDto) {
    const variant = await this.variantRepository.findOne({
      where: { id: variantId },
    });
    if (!variant) {
      throw new NotFoundException(`Variante con id ${variantId} no encontrada`);
    }
    Object.assign(variant, dto);
    return this.variantRepository.save(variant);
  }

  async removeVariant(variantId: number) {
    const variant = await this.variantRepository.findOne({
      where: { id: variantId },
    });
    if (!variant) {
      throw new NotFoundException(`Variante con id ${variantId} no encontrada`);
    }
    await this.variantRepository.remove(variant);
    return {
      status: HttpStatus.OK,
      message: `Variante con id ${variantId} eliminada correctamente`,
    };
  }

  // --- Helpers ---

  private enrichProduct(product: Product): any {
    return {
      ...product,
      variants: (product.variants || []).map((variant) => ({
        ...variant,
        cost: Number(variant.cost),
        price: Number(variant.price),
        ganancia: Number(variant.price) - Number(variant.cost),
        margen:
          Number(variant.price) > 0
            ? Math.round(
                ((Number(variant.price) - Number(variant.cost)) /
                  Number(variant.price)) *
                  10000,
              ) / 100
            : 0,
      })),
      totalStock: (product.variants || []).reduce((sum, v) => sum + v.stock, 0),
    };
  }

  private validateUniqueVariants(variants: CreateProductVariantDto[]): void {
    const seen = new Set<string>();
    for (const v of variants) {
      const key = `${v.color.toLowerCase()}-${v.size.toLowerCase()}`;
      if (seen.has(key)) {
        throw new BadRequestException(
          `Variantes duplicadas: color "${v.color}" talle "${v.size}"`,
        );
      }
      seen.add(key);
    }
  }
}
