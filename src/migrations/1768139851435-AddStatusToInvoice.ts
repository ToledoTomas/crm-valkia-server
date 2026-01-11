import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToInvoice1768139851435 implements MigrationInterface {
  name = 'AddStatusToInvoice1768139851435';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD COLUMN IF NOT EXISTS "status" character varying NOT NULL DEFAULT 'PENDING'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "status"`);
  }
}
