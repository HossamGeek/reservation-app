import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedShiftsTable1783932191663 implements MigrationInterface {
  name = 'AddedShiftsTable1783932191663';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "shifts" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "name" character varying(255) NOT NULL, "fromHour" integer NOT NULL, "toHour" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "providerId" bigint NOT NULL, CONSTRAINT "PK_84d692e367e4d6cdf045828768c" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "shifts"`);
  }
}
