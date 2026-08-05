import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedServiceTypeTable1783342476180 implements MigrationInterface {
  name = 'AddedServiceTypeTable1783342476180';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "service_types" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deletedAt" TIMESTAMP, "nameEn" character varying(255) NOT NULL UNIQUE, "nameAr" character varying(255) NOT NULL UNIQUE, "isActive" boolean NOT NULL DEFAULT false, "supportsOptions" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_e1f10f0d584d603d0c495a63ec0" UNIQUE ("nameEn"), CONSTRAINT "UQ_09e6172dac8ce1d3b02877061cb" UNIQUE ("nameAr"), CONSTRAINT "PK_1dc93417a097cdee3491f39d7cc" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "service_types"`);
  }
}
