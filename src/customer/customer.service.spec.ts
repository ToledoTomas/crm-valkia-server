import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customer } from './entity/customer.entity';
import { Repository } from 'typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';

describe('CustomerService', () => {
  let service: CustomerService;
  let repository: Repository<Customer>;

  const mockCustomerRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepository,
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    repository = module.get<Repository<Customer>>(getRepositoryToken(Customer));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCustomer', () => {
    it('should create and save a new customer', async () => {
      const createCustomerDto: CreateCustomerDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      };
      const savedCustomer = { id: 1, ...createCustomerDto };

      mockCustomerRepository.create.mockReturnValue(savedCustomer);
      mockCustomerRepository.save.mockResolvedValue(savedCustomer);

      const result = await service.createCustomer(createCustomerDto);

      expect(mockCustomerRepository.create).toHaveBeenCalledWith(
        createCustomerDto,
      );
      expect(mockCustomerRepository.save).toHaveBeenCalledWith(savedCustomer);
      expect(result).toEqual(savedCustomer);
    });
  });
});
