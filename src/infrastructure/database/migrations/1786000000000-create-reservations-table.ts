import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReservationsTable1786000000000 implements MigrationInterface {
  name = 'CreateReservationsTable1786000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."reservations_status_enum" AS ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reservations" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deletedAt" TIMESTAMP DEFAULT NULL, "clientId" bigint, "providerId" bigint, "serviceId" bigint, "shiftId" bigint, "workerId" bigint, "date" date NOT NULL, "status" "public"."reservations_status_enum" NOT NULL DEFAULT 'Pending', "notes" text, "cancellationReason" text, CONSTRAINT "PK_reservations" PRIMARY KEY ("id"), CONSTRAINT "FK_e31637a1b37f007468858cd3855" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_4a6c964aa3a68109ba99dfd0bcc" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_56b835a25b71e9955453cf43ab9" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_86e25310717b0b63dbe6cdc1160" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_c861083e2d810995e12476f5189" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE SET NULL ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_RESERVATIONS_PROVIDER_DATE" ON "reservations" ("providerId", "date", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_RESERVATIONS_CLIENT" ON "reservations" ("clientId", "status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_RESERVATIONS_CLIENT"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_RESERVATIONS_PROVIDER_DATE"`,
    );
    await queryRunner.query(`DROP TABLE "reservations"`);
    await queryRunner.query(`DROP TYPE "public"."reservations_status_enum"`);
  }
}