import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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
        price: 100,
        cost: 50,
        description: 'Test Description',
        color: ['red', 'blue'],
        size: ['S', 'M', 'L'],
        stock: 50,
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
      const products = [
        { id: 1, name: 'Product 1', price: 100 },
        { id: 2, name: 'Product 2', price: 200 },
      ];

      mockProductService.findAll.mockResolvedValue(products);

      const result = await controller.findAll();

      expect(mockProductService.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(products);
    });

    it('should return filtered products when search term is provided', async () => {
      const searchTerm = 'test';
      const products = [{ id: 1, name: 'Test Product', price: 100 }];

      mockProductService.findAll.mockResolvedValue(products);

      const result = await controller.findAll(searchTerm);

      expect(mockProductService.findAll).toHaveBeenCalledWith(searchTerm);
      expect(result).toEqual(products);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const product = { id: 1, name: 'Test Product', price: 100 };
      const id = '1';

      mockProductService.findOne.mockResolvedValue(product);

      const result = await controller.findOne(id);

      expect(mockProductService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(product);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const id = '1';
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        price: 150,
      };
      const updatedProduct = { id: 1, ...updateProductDto };

      mockProductService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update(id, updateProductDto);

      expect(mockProductService.update).toHaveBeenCalledWith(
        1,
        updateProductDto,
      );
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const id = '1';
      const deleteResult = {
        status: 200,
        message: 'Product with id: 1 deleted successfully',
      };

      mockProductService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove(id);

      expect(mockProductService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(deleteResult);
    });
  });
});
