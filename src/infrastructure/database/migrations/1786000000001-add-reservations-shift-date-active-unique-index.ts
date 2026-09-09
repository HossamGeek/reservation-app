import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReservationsShiftDateActiveUniqueIndex1786000000001
  implements MigrationInterface
{
  name = 'AddReservationsShiftDateActiveUniqueIndex1786000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_RESERVATIONS_PROVIDER_DATE"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_RESERVATIONS_CLIENT"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_RESERVATIONS_SHIFT_DATE_ACTIVE" ON "reservations" ("shiftId", "date") WHERE "status" <> 'Cancelled'::"public"."reservations_status_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."UQ_RESERVATIONS_SHIFT_DATE_ACTIVE"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_RESERVATIONS_PROVIDER_DATE" ON "reservations" ("providerId", "date", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_RESERVATIONS_CLIENT" ON "reservations" ("clientId", "status")`,
    );
  }
}