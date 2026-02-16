import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { AuthGuard } from '../auth/auth.guard';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const mockProductService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByName: jest.fn(),
    addVariant: jest.fn(),
    updateVariant: jest.fn(),
    removeVariant: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        category: 'Test Category',
        description: 'Test Description',
      };
      const savedProduct = { id: 1, ...createProductDto };

      mockProductService.create.mockResolvedValue(savedProduct);

      const result = await controller.create(createProductDto);

      expect(mockProductService.create).toHaveBeenCalledWith(createProductDto);
      expect(result).toEqual(savedProduct);
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const products = {
        data: [
          { id: 1, name: 'Product 1' },
          { id: 2, name: 'Product 2' },
        ],
        meta: { total: 2, page: 1, last_page: 1 },
      };

      mockProductService.findAll.mockResolvedValue(products);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(mockProductService.findAll).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        undefined,
      );
      expect(result).toEqual(products);
    });

    it('should return filtered products when search term is provided', async () => {
      const searchTerm = 'test';
      const products = {
        data: [{ id: 1, name: 'Test Product' }],
        meta: { total: 1, page: 1, last_page: 1 },
      };

      mockProductService.findAll.mockResolvedValue(products);

      const result = await controller.findAll(
        { page: 1, limit: 10 },
        searchTerm,
      );

      expect(mockProductService.findAll).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        searchTerm,
      );
      expect(result).toEqual(products);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const product = { id: 1, name: 'Test Product' };

      mockProductService.findOne.mockResolvedValue(product);

      const result = await controller.findOne(1);

      expect(mockProductService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(product);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
      };
      const updatedProduct = { id: 1, ...updateProductDto };

      mockProductService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update(1, updateProductDto);

      expect(mockProductService.update).toHaveBeenCalledWith(
        1,
        updateProductDto,
      );
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const deleteResult = {
        status: 200,
        message: 'Producto con id 1 eliminado correctamente',
      };

      mockProductService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove(1);

      expect(mockProductService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(deleteResult);
    });
  });

  describe('addVariant', () => {
    it('should add a variant to a product', async () => {
      const variantDto: CreateProductVariantDto = {
        color: 'Red',
        size: 'M',
        cost: 50,
        price: 100,
        stock: 10,
      };
      const savedVariant = { id: 1, productId: 1, ...variantDto };

      mockProductService.addVariant.mockResolvedValue(savedVariant);

      const result = await controller.addVariant(1, variantDto);

      expect(mockProductService.addVariant).toHaveBeenCalledWith(1, variantDto);
      expect(result).toEqual(savedVariant);
    });
  });
});
