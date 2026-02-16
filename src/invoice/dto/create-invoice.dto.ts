import {
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  IsPositive,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
  @IsInt()
  @IsPositive()
  productVariantId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateInvoiceDto {
  @IsNumber()
  @IsOptional()
  customerId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}
