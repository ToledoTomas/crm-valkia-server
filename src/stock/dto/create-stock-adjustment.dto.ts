import { IsInt, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateStockAdjustmentDto {
  @IsInt()
  @IsNotEmpty()
  productVariantId: number;

  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
