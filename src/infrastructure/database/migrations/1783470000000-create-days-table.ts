import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDaysTable1783470000000 implements MigrationInterface {
  name = 'CreateDaysTable1783470000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "days" (
        "id" BIGSERIAL NOT NULL, 
        "nameAr" character varying(50) NOT NULL, 
        "nameEn" character varying(50) NOT NULL, 
        "sortOrder" integer NOT NULL, 
        "createdAt" TIMESTAMP DEFAULT now(), 
        "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, 
        CONSTRAINT "UQ_days_nameAr" UNIQUE ("nameAr"), 
        CONSTRAINT "UQ_days_nameEn" UNIQUE ("nameEn"), 
        CONSTRAINT "PK_days_id" PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "days"`);
  }
}
