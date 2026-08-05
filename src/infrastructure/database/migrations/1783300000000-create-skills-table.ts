import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSkillsTable1783300000000 implements MigrationInterface {
  name = 'CreateSkillsTable1783300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "skills" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deletedAt" TIMESTAMP, "nameAr" character varying(255) NOT NULL, "nameEn" character varying(255) NOT NULL, "isActive" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_skills_nameAr" UNIQUE ("nameAr"), CONSTRAINT "UQ_skills_nameEn" UNIQUE ("nameEn"), CONSTRAINT "PK_skills_id" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "skills"`);
  }
}
