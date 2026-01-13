import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Invoice } from './entity/invoice.entity';
import { Customer } from '../customer/entity/customer.entity';
import { Product } from '../product/entities/product.entity';
import { Repository, DataSource, ObjectLiteral } from 'typeorm';

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('InvoiceService', () => {
  let service: InvoiceService;
  let invoiceRepository: MockRepository<Invoice>;
  let customerRepository: MockRepository<Customer>;
  let productRepository: MockRepository<Product>;
  let dataSource: any;
  let entityManager: any;

  beforeEach(async () => {
    entityManager = {
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    dataSource = {
      manager: {
        transaction: jest.fn((cb) => cb(entityManager)),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: getRepositoryToken(Invoice),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
    invoiceRepository = module.get(getRepositoryToken(Invoice));
    customerRepository = module.get(getRepositoryToken(Customer));
    productRepository = module.get(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createInvoice', () => {
    it('should create an invoice with valid data and decrement stock', async () => {
      const customer = { id: 1, name: 'John Doe' };
      const product = { id: 1, name: 'Product A', price: 100, stock: 10 };
      const updatedProduct = { ...product, stock: 9 };
      const invoiceDto = {
        customer: 1,
        products: [1],
        total: 0,
        created_at: new Date(),
        id: 0,
        status: 'PENDING',
      };
      const savedInvoice = {
        id: 1,
        total: 100,
        customer,
        products: [updatedProduct],
      };

      // Mock entity manager responses
      entityManager.findOneBy.mockResolvedValue(customer);
      entityManager.findOne.mockResolvedValue(product);
      entityManager.create.mockReturnValue(savedInvoice);
      entityManager.save.mockResolvedValue(savedInvoice);

      const result = await service.createInvoice(invoiceDto);

      expect(result).toEqual(savedInvoice);
      expect(dataSource.manager.transaction).toHaveBeenCalled();

      // Verify customer lookup
      expect(entityManager.findOneBy).toHaveBeenCalledWith(Customer, { id: 1 });

      // Verify product lookup and locking
      expect(entityManager.findOne).toHaveBeenCalledWith(Product, {
        where: { id: 1 },
        lock: { mode: 'pessimistic_write' },
      });

      // Verify stock update
      expect(entityManager.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, stock: 9 }),
      );

      // Verify invoice creation
      expect(entityManager.create).toHaveBeenCalledWith(
        Invoice,
        expect.objectContaining({
          total: 100,
          customer: customer,
          products: [expect.objectContaining({ id: 1 })],
        }),
      );
    });

    it('should throw error if product has no stock', async () => {
      const customer = { id: 1 };
      const product = { id: 1, stock: 0, name: 'Product A' };
      const invoiceDto = {
        customer: 1,
        products: [1],
        total: 0,
        created_at: new Date(),
        id: 0,
        status: 'PENDING',
      };

      entityManager.findOneBy.mockResolvedValue(customer);
      entityManager.findOne.mockResolvedValue(product);

      await expect(service.createInvoice(invoiceDto)).rejects.toThrow(
        'Product Product A has no available stock',
      );

      // Verify no save occurred
      expect(entityManager.save).not.toHaveBeenCalled();
    });

    it('should throw error if customer not found', async () => {
      entityManager.findOneBy.mockResolvedValue(null);
      await expect(
        service.createInvoice({
          customer: 1,
          products: [],
          total: 0,
          created_at: new Date(),
          id: 0,
          status: 'PENDING',
        }),
      ).rejects.toThrow('Customer not found');
    });
  });

  describe('findAll', () => {
    it('should return an array of invoices with relations', async () => {
      const result = {
        data: [{ id: 1, total: 100 } as Invoice],
        meta: { total: 1, page: 1, last_page: 1 },
      };

      invoiceRepository.findAndCount = jest
        .fn()
        .mockResolvedValue([result.data, 1]);

      expect(await service.findAll({ page: 1, limit: 10 })).toEqual(result);
      expect(invoiceRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        relations: {
          customer: true,
          products: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single invoice with relations', async () => {
      const result = { id: 1, total: 100 } as Invoice;
      invoiceRepository.findOne.mockResolvedValue(result);

      expect(await service.findOne(1)).toBe(result);
      expect(invoiceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: {
          customer: true,
          products: true,
        },
      });
    });
  });

  describe('remove', () => {
    it('should remove the invoice', async () => {
      const result = { affected: 1 };
      invoiceRepository.delete.mockResolvedValue(result);

      expect(await service.remove(1)).toBe(result);
      expect(invoiceRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
