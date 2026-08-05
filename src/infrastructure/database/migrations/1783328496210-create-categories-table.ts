import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoriesTable1783328496210 implements MigrationInterface {
  name = 'CreateCategoriesTable1783328496210';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deletedAt" TIMESTAMP, "nameEn" character varying(255) NOT NULL UNIQUE, "nameAr" character varying(255) NOT NULL UNIQUE, "isActive" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
