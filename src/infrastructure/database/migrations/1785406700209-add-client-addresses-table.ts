import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientAddressesTable1785406700209 implements MigrationInterface {
  name = 'AddClientAddressesTable1785406700209';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "client_addresses" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "latitude" numeric(10,7) NOT NULL, "longitude" numeric(10,7) NOT NULL, "fullAddress" text NOT NULL, "cityId" bigint, "title" character varying NOT NULL, "buildingNumber" character varying NOT NULL, "homeNumber" character varying NOT NULL, "phoneNumber" character varying NOT NULL, "isDefault" boolean NOT NULL, "clientId" bigint NOT NULL, CONSTRAINT "PK_1df84115ce2e00312a3cca277e9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_client_addresses_one_default_per_client" ON "client_addresses" ("clientId") WHERE "isDefault" = true`,
    );
    await queryRunner.query(
      `ALTER TABLE "client_addresses" ADD CONSTRAINT "FK_0d85d7849853b41b719feaf80ca" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "client_addresses" ADD CONSTRAINT "FK_e47066bf9a2848a8233f4be5343" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "client_addresses" DROP CONSTRAINT "FK_e47066bf9a2848a8233f4be5343"`,
    );
    await queryRunner.query(
      `ALTER TABLE "client_addresses" DROP CONSTRAINT "FK_0d85d7849853b41b719feaf80ca"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."UQ_client_addresses_one_default_per_client"`,
    );
    await queryRunner.query(`DROP TABLE "client_addresses"`);
  }
}
