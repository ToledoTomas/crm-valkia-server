import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: Repository<Product>;
  let variantRepository: Repository<ProductVariant>;

  const mockProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockVariantRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(ProductVariant),
          useValue: mockVariantRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    variantRepository = module.get<Repository<ProductVariant>>(
      getRepositoryToken(ProductVariant),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('should create and save a new product with variants', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        category: 'Test Category',
        description: 'Test Description',
        variants: [
          { color: 'Red', size: 'M', cost: 50, price: 100, stock: 10 },
        ],
      };
      const savedProduct = { id: 1, ...createProductDto };

      mockProductRepository.create.mockReturnValue(savedProduct);
      mockProductRepository.save.mockResolvedValue(savedProduct);

      const result = await service.create(createProductDto);

      expect(mockProductRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createProductDto.name,
          category: createProductDto.category,
        }),
      );
      expect(result).toEqual(savedProduct);
    });

    it('should throw BadRequestException for duplicate variants', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        category: 'Test Category',
        variants: [
          { color: 'Red', size: 'M', cost: 50, price: 100, stock: 10 },
          { color: 'Red', size: 'M', cost: 60, price: 110, stock: 5 },
        ],
      };

      await expect(service.create(createProductDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const products = [
        { id: 1, name: 'Product 1', variants: [] },
        { id: 2, name: 'Product 2', variants: [] },
      ];

      mockProductRepository.findAndCount.mockResolvedValue([products, 2]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a product if found', async () => {
      const id = 1;
      const product = { id: 1, name: 'Test Product', variants: [] };

      mockProductRepository.findOne.mockResolvedValue(product);

      const result = await service.findOne(id);

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['variants'],
      });
      expect(result).toEqual(
        expect.objectContaining({ id: 1, name: 'Test Product' }),
      );
    });

    it('should throw NotFoundException if product is not found', async () => {
      const id = 999;

      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product if found', async () => {
      const id = 1;
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
      };
      const existingProduct = { id: 1, name: 'Test Product', variants: [] };
      const updatedProduct = { ...existingProduct, ...updateProductDto };

      mockProductRepository.findOne.mockResolvedValue(existingProduct);
      mockProductRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.update(id, updateProductDto);

      expect(result).toEqual(updatedProduct);
    });

    it('should throw NotFoundException if product is not found', async () => {
      const id = 999;
      const updateProductDto: UpdateProductDto = { name: 'Updated' };

      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.update(id, updateProductDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a product if found', async () => {
      const id = 1;
      const product = { id: 1, name: 'Test', variants: [] };

      mockProductRepository.findOne.mockResolvedValue(product);
      mockProductRepository.remove.mockResolvedValue(undefined);

      const result = await service.remove(id);

      expect(result).toEqual({
        status: 200,
        message: `Producto con id ${id} eliminado correctamente`,
      });
    });

    it('should throw NotFoundException if product is not found', async () => {
      const id = 999;

      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addVariant', () => {
    it('should add a variant to a product', async () => {
      const productId = 1;
      const product = { id: 1, name: 'Test', variants: [] };
      const variantDto = {
        color: 'Blue',
        size: 'L',
        cost: 40,
        price: 80,
        stock: 5,
      };
      const savedVariant = { id: 1, productId, ...variantDto };

      mockProductRepository.findOne.mockResolvedValue(product);
      mockVariantRepository.create.mockReturnValue(savedVariant);
      mockVariantRepository.save.mockResolvedValue(savedVariant);

      const result = await service.addVariant(productId, variantDto);

      expect(result).toEqual(savedVariant);
    });

    it('should throw BadRequestException for duplicate variant', async () => {
      const productId = 1;
      const product = {
        id: 1,
        name: 'Test',
        variants: [{ color: 'Red', size: 'M' }],
      };
      const variantDto = {
        color: 'Red',
        size: 'M',
        cost: 40,
        price: 80,
        stock: 5,
      };

      mockProductRepository.findOne.mockResolvedValue(product);

      await expect(service.addVariant(productId, variantDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
