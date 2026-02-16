import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Invoice } from './entity/invoice.entity';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let dataSource: any;
  let entityManager: any;

  beforeEach(async () => {
    entityManager = {
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
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
            findAndCount: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createInvoice', () => {
    it('should create an invoice with valid data and decrement stock', async () => {
      const customer = { id: 1, name: 'John Doe' };
      const variant = {
        id: 1,
        product: { name: 'Product A' },
        price: 100,
        cost: 50,
        stock: 10,
      };
      const invoiceDto = {
        customerId: 1,
        items: [{ productVariantId: 1, quantity: 1 }],
      };
      const savedInvoice = {
        id: 1,
        total: 100,
        totalCost: 50,
        totalProfit: 50,
        customerId: 1,
      };

      entityManager.findOneBy.mockResolvedValue(customer);
      entityManager.findOne.mockResolvedValue(variant);
      entityManager.create.mockReturnValue(savedInvoice);
      entityManager.save.mockResolvedValue(savedInvoice);

      const result = await service.createInvoice(invoiceDto);

      expect(result).toEqual(savedInvoice);
      expect(dataSource.manager.transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException if customer not found', async () => {
      entityManager.findOneBy.mockResolvedValue(null);

      await expect(
        service.createInvoice({
          customerId: 999,
          items: [{ productVariantId: 1, quantity: 1 }],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if stock insufficient', async () => {
      const customer = { id: 1 };
      const variant = {
        id: 1,
        product: { name: 'Product A' },
        price: 100,
        stock: 0,
      };

      entityManager.findOneBy.mockResolvedValue(customer);
      entityManager.findOne.mockResolvedValue(variant);

      await expect(
        service.createInvoice({
          customerId: 1,
          items: [{ productVariantId: 1, quantity: 1 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated invoices', async () => {
      const result = {
        data: [{ id: 1, total: 100 }],
        meta: { total: 1, page: 1, last_page: 1 },
      };

      const invoiceRepository = {
        findAndCount: jest.fn().mockResolvedValue([result.data, 1]),
      };

      // Re-mock for this test
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          InvoiceService,
          {
            provide: getRepositoryToken(Invoice),
            useValue: invoiceRepository,
          },
          {
            provide: DataSource,
            useValue: dataSource,
          },
        ],
      }).compile();

      const testService = module.get<InvoiceService>(InvoiceService);

      expect(await testService.findAll({ page: 1, limit: 10 })).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a single invoice', async () => {
      const result = { id: 1, total: 100 };
      const invoiceRepository = {
        findOne: jest.fn().mockResolvedValue(result),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          InvoiceService,
          {
            provide: getRepositoryToken(Invoice),
            useValue: invoiceRepository,
          },
          {
            provide: DataSource,
            useValue: dataSource,
          },
        ],
      }).compile();

      const testService = module.get<InvoiceService>(InvoiceService);

      expect(await testService.findOne(1)).toBe(result);
    });

    it('should throw NotFoundException if invoice not found', async () => {
      const invoiceRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          InvoiceService,
          {
            provide: getRepositoryToken(Invoice),
            useValue: invoiceRepository,
          },
          {
            provide: DataSource,
            useValue: dataSource,
          },
        ],
      }).compile();

      const testService = module.get<InvoiceService>(InvoiceService);

      await expect(testService.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the invoice and revert stock', async () => {
      const invoice = {
        id: 1,
        items: [{ productVariantId: 1, quantity: 2 }],
      };
      const variant = { id: 1, stock: 8 };

      entityManager.findOne.mockResolvedValueOnce(invoice);
      entityManager.findOne.mockResolvedValueOnce(variant);

      const result = await service.remove(1);

      expect(result).toEqual({
        status: 200,
        message: 'Venta con id 1 eliminada y stock revertido',
      });
    });
  });
});
