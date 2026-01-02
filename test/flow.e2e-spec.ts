import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './../src/auth/auth.service';
import { ProductService } from './../src/product/product.service';
import { CustomerService } from './../src/customer/customer.service';
import { InvoiceService } from './../src/invoice/invoice.service';
import { AuthController } from './../src/auth/auth.controller';
import { ProductController } from './../src/product/product.controller';
import { CustomerController } from './../src/customer/customer.controller';
import { InvoiceController } from './../src/invoice/invoice.controller';
import { AuthGuard } from './../src/auth/auth.guard';

describe('Business Flow (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let accessToken: string;

  // Mocks
  const mockAuthService = {
    loginService: jest.fn().mockImplementation(async (user) => {
      // Return a real token signed with the test secret
      const payload = { email: user.email, sub: 1 };
      const token = await jwtService.signAsync(payload);
      return { accessToken: token };
    }),
  };

  const mockProductService = {
    create: jest.fn().mockImplementation((dto) => ({
      id: 1,
      ...dto,
    })),
  };

  const mockCustomerService = {
    createCustomer: jest.fn().mockImplementation((dto) => ({
      id: 1,
      ...dto,
    })),
  };

  const mockInvoiceService = {
    createInvoice: jest.fn().mockImplementation((dto) => ({
      id: 1,
      ...dto,
      created_at: new Date(),
    })),
  };

  beforeAll(async () => {
    // Set env var expected by AuthGuard if it reads process.env directly
    // Ideally we should inject ConfigService but AuthGuard reads process.env.JWT_SECRET_TOKEN
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
        AuthGuard, // Provide AuthGuard so @UseGuards works
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    jwtService = moduleFixture.get<JwtService>(JwtService);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/login (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password' })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    accessToken = response.body.accessToken;
  });

  it('/products (POST)', async () => {
    // Note: The AuthController.login sets status OK (200) explicitly?
    // Checking auth.controller.ts: @HttpCode(HttpStatus.OK)

    const createProductDto = {
      name: 'Camiseta',
      price: 2000,
      cost: 1000,
      description: 'Camiseta de algodon',
      color: ['Rojo', 'Azul'],
      size: ['M', 'L'],
      stock: 50,
    };

    const response = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createProductDto)
      .expect(201);

    expect(response.body).toMatchObject(createProductDto);
    expect(response.body).toHaveProperty('id');
  });

  it('/customer (POST)', async () => {
    const createCustomerDto = {
      name: 'Juan Perez',
      email: 'juan@test.com',
      phone: '123456789',
    };

    const response = await request(app.getHttpServer())
      .post('/customer')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createCustomerDto)
      .expect(201);

    expect(response.body).toMatchObject(createCustomerDto);
    expect(response.body).toHaveProperty('id');
  });

  it('/invoice (POST)', async () => {
    const createInvoiceDto = {
      id: 123,
      customer: 1,
      products: [1],
      total: 2000,
      created_at: new Date().toISOString(),
    };

    const response = await request(app.getHttpServer())
      .post('/invoice')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createInvoiceDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
  });
});
