import { IsNumber, IsArray, IsDateString } from 'class-validator';

export class CreateInvoiceDto {
  @IsNumber()
  id: number;

  @IsNumber()
  customer: number;

  @IsArray()
  @IsNumber({}, { each: true })
  products: number[];

  @IsNumber()
  total: number;

  @IsDateString()
  created_at: Date;
}
