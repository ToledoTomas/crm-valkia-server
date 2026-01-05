import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  fullname: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  invoiceId?: string;
}
