import {
  IsNumber,
  IsArray,
  IsDateString,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateInvoiceDto {
  @IsNumber()
  id: number;

  @IsNumber()
  customer: number;

  @IsArray()
  @IsNumber({}, { each: true })
  products: number[];

  @IsString()
  @IsOptional()
  status: string;

  @IsNumber()
  total: number;

  @IsDateString()
  created_at: Date;
}
