import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository, Like } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;
  let repository: Repository<Product>;

  const mockProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    preload: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('should create and save a new product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        price: 100,
        description: 'Test Description',
        color: ['red', 'blue'],
        size: ['S', 'M', 'L'],
        stock: 50,
      };
      const savedProduct = { id: 1, ...createProductDto };

      mockProductRepository.create.mockReturnValue(savedProduct);
      mockProductRepository.save.mockResolvedValue(savedProduct);

      const result = await service.create(createProductDto);

      expect(mockProductRepository.create).toHaveBeenCalledWith(
        createProductDto,
      );
      expect(mockProductRepository.save).toHaveBeenCalledWith(savedProduct);
      expect(result).toEqual(savedProduct);
    });
  });

  describe('findAll', () => {
    it('should return all products when no search term is provided', async () => {
      const products = [
        { id: 1, name: 'Product 1', price: 100 },
        { id: 2, name: 'Product 2', price: 200 },
      ];

      mockProductRepository.find.mockResolvedValue(products);

      const result = await service.findAll();

      expect(mockProductRepository.find).toHaveBeenCalledWith();
      expect(result).toEqual(products);
    });

    it('should return filtered products when search term is provided', async () => {
      const searchTerm = 'test';
      const products = [{ id: 1, name: 'Test Product', price: 100 }];

      mockProductRepository.find.mockResolvedValue(products);

      const result = await service.findAll(searchTerm);

      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: {
          name: Like(`%${searchTerm}%`),
        },
      });
      expect(result).toEqual(products);
    });
  });

  describe('findOne', () => {
    it('should return a product if found', async () => {
      const id = 1;
      const product = { id: 1, name: 'Test Product', price: 100 };

      mockProductRepository.findOne.mockResolvedValue(product);

      const result = await service.findOne(id);

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(product);
    });

    it('should throw NotFoundException if product is not found', async () => {
      const id = 999;

      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(id)).rejects.toThrow(
        `Product with id: ${id} not found`,
      );
    });
  });

  describe('update', () => {
    it('should update a product if found', async () => {
      const id = 1;
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        price: 150,
      };
      const existingProduct = { id: 1, name: 'Test Product', price: 100 };
      const updatedProduct = { ...existingProduct, ...updateProductDto };

      mockProductRepository.preload.mockResolvedValue(existingProduct);
      mockProductRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.update(id, updateProductDto);

      expect(mockProductRepository.preload).toHaveBeenCalledWith({
        id,
        ...updateProductDto,
      });
      expect(mockProductRepository.save).toHaveBeenCalledWith(existingProduct);
      expect(result).toEqual(updatedProduct);
    });

    it('should throw NotFoundException if product is not found', async () => {
      const id = 999;
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
      };

      mockProductRepository.preload.mockResolvedValue(null);

      await expect(service.update(id, updateProductDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(id, updateProductDto)).rejects.toThrow(
        `Product with id: ${id} not found`,
      );
    });
  });

  describe('remove', () => {
    it('should delete a product if found', async () => {
      const id = 1;
      const deleteResult = { affected: 1 };

      mockProductRepository.delete.mockResolvedValue(deleteResult);

      const result = await service.remove(id);

      expect(mockProductRepository.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual({
        status: 200,
        message: `Product with id: ${id} deleted successfully`,
      });
    });

    it('should throw NotFoundException if product is not found', async () => {
      const id = 999;
      const deleteResult = { affected: 0 };

      mockProductRepository.delete.mockResolvedValue(deleteResult);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
      await expect(service.remove(id)).rejects.toThrow(
        `Product with id: ${id} not found`,
      );
    });
  });
});

