import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Product } from './product/entities/product.entity';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { InvoiceModule } from './invoice/invoice.module';
import { CustomerModule } from './customer/customer.module';
import { AuthModule } from './auth/auth.module';
import { User } from './user/entity/user.entity';
import { Invoice } from './invoice/entity/invoice.entity';
import { Customer } from './customer/entity/customer.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET_TOKEN');
        if (!secret) {
          throw new Error(
            'JWT_SECRET_TOKEN is not configured. Please set it in your .env file.',
          );
        }
        return {
          secret,
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Product, User, Invoice, Customer],
      synchronize: true,
    }),
    AuthModule,
    UserModule,
    InvoiceModule,
    CustomerModule,
    ProductModule,
  ],
})
export class AppModule {}
