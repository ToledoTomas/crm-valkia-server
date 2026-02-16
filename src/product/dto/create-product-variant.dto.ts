import {
  IsString,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateProductVariantDto {
  @IsString()
  color: string;

  @IsString()
  size: string;

  @IsNumber()
  @IsPositive()
  cost: number;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  minStock?: number;
}
