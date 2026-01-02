import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entity/customer.entity';
import { AuthModule } from '../auth/auth.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), AuthModule],
  controllers: [CustomerController],
  providers: [CustomerService, JwtService],
})
export class CustomerModule {}
