import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

describe('InvoiceController', () => {
  let controller: InvoiceController;
  let service: InvoiceService;

  const mockInvoiceService = {
    createInvoice: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceController],
      providers: [
        {
          provide: InvoiceService,
          useValue: mockInvoiceService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<InvoiceController>(InvoiceController);
    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createInvoice', () => {
    it('should create an invoice', async () => {
      const dto: CreateInvoiceDto = { customer: 1, products: [1, 2] };
      const result = { id: 1, ...dto };
      mockInvoiceService.createInvoice.mockResolvedValue(result);

      expect(await controller.createInvoice(dto)).toBe(result);
      expect(service.createInvoice).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of invoices', async () => {
      const result = [{ id: 1 }];
      mockInvoiceService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single invoice', async () => {
      const result = { id: 1 };
      mockInvoiceService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('1')).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('remove', () => {
    it('should remove an invoice', async () => {
      const result = { affected: 1 };
      mockInvoiceService.remove.mockResolvedValue(result);

      expect(await controller.remove('1')).toBe(result);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
