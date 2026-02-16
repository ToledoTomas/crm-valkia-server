import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { AuthGuard } from '../auth/auth.guard';
import { SearchProductDto } from './dto/search-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('products')
@UseGuards(AuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('search') searchTerm?: string,
  ) {
    return this.productService.findAll(paginationDto, searchTerm);
  }

  @Get('search')
  findByName(@Query() dto: SearchProductDto) {
    return this.productService.findByName(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }

  // --- Variant endpoints ---

  @Post(':id/variants')
  addVariant(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProductVariantDto,
  ) {
    return this.productService.addVariant(id, dto);
  }

  @Patch('variants/:variantId')
  updateVariant(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() dto: UpdateProductVariantDto,
  ) {
    return this.productService.updateVariant(variantId, dto);
  }

  @Delete('variants/:variantId')
  removeVariant(@Param('variantId', ParseIntPipe) variantId: number) {
    return this.productService.removeVariant(variantId);
  }
}
