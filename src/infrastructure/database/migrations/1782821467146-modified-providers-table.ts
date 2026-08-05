import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifiedProvidersTable1782821467146 implements MigrationInterface {
  name = 'ModifiedProvidersTable1782821467146';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "addressAr"`);
    await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "addressEn"`);
    await queryRunner.query(
      `ALTER TABLE "documents" ADD "status" character varying(50) NOT NULL DEFAULT 'Pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD "rejectionReason" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "rejectionReason" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "approvedById" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "approvedAt" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "providers" ADD "logoId" bigint`);
    await queryRunner.query(
      `ALTER TABLE "providers" ADD CONSTRAINT "UQ_7202780a20d5f38f4f329659a0f" UNIQUE ("logoId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD CONSTRAINT "FK_c7f0e2d7790cd985ce1bb99b386" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD CONSTRAINT "FK_7202780a20d5f38f4f329659a0f" FOREIGN KEY ("logoId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "providers" DROP CONSTRAINT "FK_7202780a20d5f38f4f329659a0f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" DROP CONSTRAINT "FK_c7f0e2d7790cd985ce1bb99b386"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" DROP CONSTRAINT "UQ_7202780a20d5f38f4f329659a0f"`,
    );
    await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "logoId"`);
    await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "approvedAt"`);
    await queryRunner.query(
      `ALTER TABLE "providers" DROP COLUMN "approvedById"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" DROP COLUMN "rejectionReason"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" DROP COLUMN "rejectionReason"`,
    );
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "status"`);
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "addressEn" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "addressAr" character varying(255) NOT NULL`,
    );
  }
}
