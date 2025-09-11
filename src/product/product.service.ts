import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

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

  findAllProducts(): Promise<Product[]> {
    return this.productRepository.find();
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
}
