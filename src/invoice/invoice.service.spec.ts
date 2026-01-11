import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Invoice } from './entity/invoice.entity';
import { Customer } from '../customer/entity/customer.entity';
import { Product } from '../product/entities/product.entity';
import { Repository } from 'typeorm';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('InvoiceService', () => {
  let service: InvoiceService;
  let invoiceRepository: MockRepository<Invoice>;
  let customerRepository: MockRepository<Customer>;
  let productRepository: MockRepository<Product>;

  beforeEach(async () => {
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
    it('should create an invoice with valid data', async () => {
      const customer = { id: 1, name: 'John Doe' };
      const product = { id: 1, name: 'Product A', price: 100, stock: 10 };
      const invoiceDto = {
        customer: 1,
        products: [1],
        total: 0,
        created_at: new Date(),
        id: 0,
      };
      const savedInvoice = { id: 1, total: 100, customer, products: [product] };

      customerRepository.findOneBy.mockResolvedValue(customer);
      productRepository.findOneBy.mockResolvedValue(product);
      invoiceRepository.create.mockReturnValue(savedInvoice);
      invoiceRepository.save.mockResolvedValue(savedInvoice);

      const result = await service.createInvoice(invoiceDto);

      expect(result).toEqual(savedInvoice);
      expect(invoiceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          total: 100,
          customer: customer,
          products: [product],
        }),
      );
    });

    it('should throw error if product has no stock', async () => {
      const customer = { id: 1 };
      const product = { id: 1, stock: 0 };
      const invoiceDto = {
        customer: 1,
        products: [1],
        total: 0,
        created_at: new Date(),
        id: 0,
      };

      customerRepository.findOneBy.mockResolvedValue(customer);
      productRepository.findOneBy.mockResolvedValue(product);

      await expect(service.createInvoice(invoiceDto)).rejects.toThrow(
        'Product undefined has no available stock',
      );
    });

    it('should throw error if customer not found', async () => {
      customerRepository.findOneBy.mockResolvedValue(null);
      await expect(
        service.createInvoice({
          customer: 1,
          products: [],
          total: 0,
          created_at: new Date(),
          id: 0,
        }),
      ).rejects.toThrow('Customer not found');
    });
  });

  describe('findAll', () => {
    it('should return an array of invoices with relations', async () => {
      const result = [{ id: 1, total: 100 }] as Invoice[];
      invoiceRepository.find.mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(invoiceRepository.find).toHaveBeenCalledWith({
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
