import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1771213684815 implements MigrationInterface {
  name = 'InitialSchema1771213684815';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing tables if they exist
    await queryRunner.query(`DROP TABLE IF EXISTS "invoice_item" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "stock_movement" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_variant" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invoice" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "customer" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user" CASCADE`);
    // Note: We don't drop the migrations table - TypeORM manages it
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."stock_movement_type_enum"`,
    );

    // Create tables
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "category" character varying NOT NULL, "description" character varying, "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_variant" ("id" SERIAL NOT NULL, "productId" integer NOT NULL, "color" character varying NOT NULL, "size" character varying NOT NULL, "cost" numeric(10,2) NOT NULL, "price" numeric(10,2) NOT NULL, "stock" integer NOT NULL DEFAULT '0', "minStock" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_1ab69c9935c61f7c70791ae0a9f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "customer" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "phone" character varying, "email" character varying, "instagram" character varying, "birthday" date, "deletedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "invoice" ("id" SERIAL NOT NULL, "customerId" integer, "total" numeric(10,2) NOT NULL, "totalCost" numeric(10,2) NOT NULL, "totalProfit" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_45dc41c6acd738da6b1f7ae439f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "invoice_item" ("id" SERIAL NOT NULL, "invoiceId" integer NOT NULL, "productVariantId" integer NOT NULL, "quantity" integer NOT NULL, "priceAtSale" numeric(10,2) NOT NULL, "costAtSale" numeric(10,2) NOT NULL, CONSTRAINT "PK_621317346abdf61295516f3cb76" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."stock_movement_type_enum" AS ENUM('SALE', 'MANUAL_ADJUSTMENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "stock_movement" ("id" SERIAL NOT NULL, "productVariantId" integer NOT NULL, "type" "public"."stock_movement_type_enum" NOT NULL, "quantity" integer NOT NULL, "reason" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9fe1232f916686ae8cf00294749" PRIMARY KEY ("id"))`,
    );

    // Foreign keys
    await queryRunner.query(
      `ALTER TABLE "product_variant" ADD CONSTRAINT "FK_6e420052844edf3a5506d863ce6" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD CONSTRAINT "FK_3c33cb8284757ebfa00fc70be5a" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice_item" ADD CONSTRAINT "FK_553d5aac210d22fdca5c8d48ead" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice_item" ADD CONSTRAINT "FK_180250bd377d4d83b3512a43a11" FOREIGN KEY ("productVariantId") REFERENCES "product_variant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movement" ADD CONSTRAINT "FK_e65ba3882557cab4febb54809bb" FOREIGN KEY ("productVariantId") REFERENCES "product_variant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stock_movement" DROP CONSTRAINT "FK_e65ba3882557cab4febb54809bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice_item" DROP CONSTRAINT "FK_180250bd377d4d83b3512a43a11"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice_item" DROP CONSTRAINT "FK_553d5aac210d22fdca5c8d48ead"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP CONSTRAINT "FK_3c33cb8284757ebfa00fc70be5a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant" DROP CONSTRAINT "FK_6e420052844edf3a5506d863ce6"`,
    );
    await queryRunner.query(`DROP TABLE "stock_movement"`);
    await queryRunner.query(`DROP TYPE "public"."stock_movement_type_enum"`);
    await queryRunner.query(`DROP TABLE "invoice_item"`);
    await queryRunner.query(`DROP TABLE "invoice"`);
    await queryRunner.query(`DROP TABLE "customer"`);
    await queryRunner.query(`DROP TABLE "product_variant"`);
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
