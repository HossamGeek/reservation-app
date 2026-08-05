import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveBranchCity1782631600484 implements MigrationInterface {
  name = 'RemoveBranchCity1782631600484';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_BRANCH_CITY"`);
    await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "cityId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "branches" ADD "cityId" bigint NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_BRANCH_CITY" ON "branches" ("cityId") `,
    );
  }
}
