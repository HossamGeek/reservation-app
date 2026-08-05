import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBranchStatus1782630053231 implements MigrationInterface {
  name = 'AddBranchStatus1782630053231';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "branches" ADD "status" character varying(50) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "status"`);
  }
}
