import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRejectedStatusToReservationsStatusEnum1786000000002
  implements MigrationInterface
{
  name = 'AddRejectedStatusToReservationsStatusEnum1786000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."reservations_status_enum" ADD VALUE IF NOT EXISTS 'Rejected'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // The partial unique index predicate references the enum type
    // ('Cancelled'::"public"."reservations_status_enum"), so it must be
    // dropped before the type is recreated and restored afterwards with the
    // exact original definition from migration 1786000000001.
    await queryRunner.query(
      `DROP INDEX "public"."UQ_RESERVATIONS_SHIFT_DATE_ACTIVE"`,
    );

    // Map Rejected rows to Cancelled while the old enum still exists.
    // Cancelled is the only terminal non-active legacy status, so it is the
    // closest reversible equivalent for a rejected reservation.
    await queryRunner.query(
      `UPDATE "reservations" SET "status" = 'Cancelled' WHERE "status" = 'Rejected'`,
    );

    // The column default ('Pending') cannot be cast automatically between the
    // old and recreated enum types, so drop it before the conversion and
    // restore it afterwards.
    await queryRunner.query(
      `ALTER TABLE "reservations" ALTER COLUMN "status" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TYPE "public"."reservations_status_enum" RENAME TO "reservations_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reservations_status_enum" AS ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ALTER COLUMN "status" TYPE "public"."reservations_status_enum" USING "status"::text::"public"."reservations_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."reservations_status_enum_old"`,
    );

    await queryRunner.query(
      `ALTER TABLE "reservations" ALTER COLUMN "status" SET DEFAULT 'Pending'`,
    );

    // Recreate the exact original partial unique index from migration
    // 1786000000001 once the status column uses the recreated legacy enum.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_RESERVATIONS_SHIFT_DATE_ACTIVE" ON "reservations" ("shiftId", "date") WHERE "status" <> 'Cancelled'::"public"."reservations_status_enum"`,
    );
  }
}