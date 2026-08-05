import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLanguagesTable1783400000000 implements MigrationInterface {
  name = 'CreateLanguagesTable1783400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "languages" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deletedAt" TIMESTAMP, "nameAr" character varying(255) NOT NULL, "nameEn" character varying(255) NOT NULL, "isActive" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_languages_nameAr" UNIQUE ("nameAr"), CONSTRAINT "UQ_languages_nameEn" UNIQUE ("nameEn"), CONSTRAINT "PK_languages_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_languages_nameAr" ON "languages" ("nameAr")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_languages_nameEn" ON "languages" ("nameEn")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_languages_isActive" ON "languages" ("isActive")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_languages_isActive"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_languages_nameEn"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_languages_nameAr"`);
    await queryRunner.query(`DROP TABLE "languages"`);
  }
}
