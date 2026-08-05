import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNationalIdToClientTable1785404126215 implements MigrationInterface {
  name = 'AddNationalIdToClientTable1785404126215';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clients" ADD "nationalId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" ADD CONSTRAINT "UQ_e0a6f804b8cf55b333b491a17ca" UNIQUE ("nationalId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clients" DROP CONSTRAINT "UQ_e0a6f804b8cf55b333b491a17ca"`,
    );
    await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "nationalId"`);
  }
}
