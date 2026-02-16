import { IsString, IsEmail, IsOptional, IsDateString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsDateString()
  @IsOptional()
  birthday?: string;
}
