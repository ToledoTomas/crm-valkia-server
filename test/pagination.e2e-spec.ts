import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ProductService } from './../src/product/product.service';
import { CustomerService } from './../src/customer/customer.service';
import { InvoiceService } from './../src/invoice/invoice.service';
import { ProductController } from './../src/product/product.controller';
import { CustomerController } from './../src/customer/customer.controller';
import { InvoiceController } from './../src/invoice/invoice.controller';
import { AuthController } from './../src/auth/auth.controller';
import { AuthGuard } from './../src/auth/auth.guard';
import { PaginationDto } from './../src/common/dto/pagination.dto';
import { AuthService } from './../src/auth/auth.service';

describe('Pagination (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let accessToken: string;

  const mockPaginatedResult = {
    data: [],
    meta: {
      total: 0,
      page: 1,
      last_page: 0,
    },
  };

  const mockProductService = {
    findAll: jest.fn().mockResolvedValue(mockPaginatedResult),
  };

  const mockCustomerService = {
    getCustomers: jest.fn().mockResolvedValue(mockPaginatedResult),
  };

  const mockInvoiceService = {
    findAll: jest.fn().mockResolvedValue(mockPaginatedResult),
  };

  const mockAuthService = {
    loginService: jest.fn().mockImplementation(async (user) => {
      const payload = { email: user.email, sub: 1 };
      const token = await jwtService.signAsync(payload);
      return { accessToken: token };
    }),
  };

  beforeAll(async () => {
    process.env.JWT_SECRET_TOKEN = 'test_secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test_secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [
        AuthController,
        ProductController,
        CustomerController,
        InvoiceController,
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ProductService, useValue: mockProductService },
        { provide: CustomerService, useValue: mockCustomerService },
        { provide: InvoiceService, useValue: mockInvoiceService },
        AuthGuard,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true, // Important for DTO transformation
      }),
    );

    await app.init();

    // Create token
    accessToken = await jwtService.signAsync({
      email: 'test@test.com',
      sub: 1,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/products (GET)', () => {
    it('should return paginated result and call service with default pagination', async () => {
      await request(app.getHttpServer())
        .get('/products')
        // .set('Authorization', `Bearer ${accessToken}`) // Product findAll might be public? Controller doesn't have @UseGuards on findAll
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mockPaginatedResult);
        });

      expect(mockProductService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 10 }),
        undefined,
      );
    });

    it('should accept page and limit params', async () => {
      await request(app.getHttpServer())
        .get('/products?page=2&limit=5')
        .expect(200);

      expect(mockProductService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, limit: 5 }),
        undefined,
      );
    });
  });

  describe('/customer (GET)', () => {
    it('should return paginated result', async () => {
      await request(app.getHttpServer())
        .get('/customer')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mockPaginatedResult);
        });

      expect(mockCustomerService.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 10 }),
        undefined,
      );
    });
  });

  describe('/invoice (GET)', () => {
    it('should return paginated result', async () => {
      await request(app.getHttpServer())
        .get('/invoice')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mockPaginatedResult);
        });

      expect(mockInvoiceService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 10 }),
      );
    });
  });
});
