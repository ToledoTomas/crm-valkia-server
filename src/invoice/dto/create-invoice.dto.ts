export class CreateInvoiceDto {
  id: number;
  customer: number;
  products: number[];
  total: number;
  created_at: Date;
}
