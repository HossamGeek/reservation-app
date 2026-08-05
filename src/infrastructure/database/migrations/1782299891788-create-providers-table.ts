import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProvidersTable1782299891788 implements MigrationInterface {
  name = 'CreateProvidersTable1782299891788';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "workers" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_e950c9aba3bd84a4f193058d838" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "system-admins" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_2ce02304394fb9bca8ca7197d34" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider-admins" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_f275f64641e0f0bee6bcbfe4be7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "clients" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "providers" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deletedAt" TIMESTAMP, CONSTRAINT "PK_af13fc2ebf382fe0dad2e4793aa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "deletedAt" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`DROP TABLE "providers"`);
    await queryRunner.query(`DROP TABLE "clients"`);
    await queryRunner.query(`DROP TABLE "provider-admins"`);
    await queryRunner.query(`DROP TABLE "system-admins"`);
    await queryRunner.query(`DROP TABLE "workers"`);
  }
}
