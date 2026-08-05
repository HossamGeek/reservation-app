import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameAndAddProviderColumns1783456789000 implements MigrationInterface {
  name = 'RenameAndAddProviderColumns1783456789000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop old foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "providers" DROP CONSTRAINT "FK_c7f0e2d7790cd985ce1bb99b386"`,
    );

    // Rename columns
    await queryRunner.query(
      `ALTER TABLE "providers" RENAME COLUMN "approvedById" TO "reviewedById"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" RENAME COLUMN "approvedAt" TO "reviewedAt"`,
    );

    // Add createdById column
    await queryRunner.query(`ALTER TABLE "providers" ADD "createdById" bigint`);

    // Recreate foreign key constraint for reviewedById
    await queryRunner.query(
      `ALTER TABLE "providers" ADD CONSTRAINT "FK_providers_reviewedById" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );

    // Add foreign key constraint for createdById
    await queryRunner.query(
      `ALTER TABLE "providers" ADD CONSTRAINT "FK_providers_createdById" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop new foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "providers" DROP CONSTRAINT "FK_providers_createdById"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" DROP CONSTRAINT "FK_providers_reviewedById"`,
    );

    // Drop createdById column
    await queryRunner.query(
      `ALTER TABLE "providers" DROP COLUMN "createdById"`,
    );

    // Rename columns back
    await queryRunner.query(
      `ALTER TABLE "providers" RENAME COLUMN "reviewedById" TO "approvedById"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" RENAME COLUMN "reviewedAt" TO "approvedAt"`,
    );

    // Recreate old foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "providers" ADD CONSTRAINT "FK_c7f0e2d7790cd985ce1bb99b386" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }
}
