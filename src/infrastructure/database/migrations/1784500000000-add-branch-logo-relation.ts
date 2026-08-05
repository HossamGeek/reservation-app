import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBranchLogoRelation1784500000000 implements MigrationInterface {
  name = 'AddBranchLogoRelation1784500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "branches" ADD "logoId" bigint`);
    await queryRunner.query(
      `ALTER TABLE "branches" ADD CONSTRAINT "FK_branch_logoId_documents_id" FOREIGN KEY ("logoId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "branches" ALTER COLUMN "status" SET DEFAULT 'INACTIVE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "branches" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "branches" DROP CONSTRAINT "FK_branch_logoId_documents_id"`,
    );
    await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "logoId"`);
  }
}
