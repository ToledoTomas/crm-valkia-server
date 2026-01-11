import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Like, Repository, FindManyOptions } from 'typeorm';
import { SearchProductDto } from './dto/search-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create(createProductDto);
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
    };

    if (searchTerm) {
      queryOptions.where = {
        name: Like(`%${searchTerm}%`),
      };
    }

    const [data, total] =
      await this.productRepository.findAndCount(queryOptions);

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
    const productFound = await this.productRepository.findOne({
      where: { id },
    });
    if (!productFound) {
      throw new NotFoundException(`Product with id: ${id} not found`);
    }
    return productFound;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    });
    if (!product) {
      throw new NotFoundException(`Product with id: ${id} not found`);
    }
    return this.productRepository.save(product);
  }

  async remove(id: number) {
    const deletedProduct = await this.productRepository.delete(id);
    if (deletedProduct.affected === 0) {
      throw new NotFoundException(`Product with id: ${id} not found`);
    }
    return {
      status: HttpStatus.OK,
      message: `Product with id: ${id} deleted successfully`,
    };
  }

  async findByName(dto: SearchProductDto): Promise<Product[]> {
    const { name } = dto;
    const query = this.productRepository.createQueryBuilder('product');
    if (name) {
      query.andWhere('product.name ILIKE :name', { name: `%${name}%` });
    }
    return query.getMany();
  }
}
