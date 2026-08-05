import { MigrationInterface, QueryRunner } from 'typeorm';

export class BranchCityRelation1782821982233 implements MigrationInterface {
  name = 'BranchCityRelation1782821982233';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "branches" ADD "cityId" bigint`);
    await queryRunner.query(
      `ALTER TABLE "branches" ADD CONSTRAINT "FK_3d3edc7bbc6f133907163ff9cdc" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "branches" DROP CONSTRAINT "FK_3d3edc7bbc6f133907163ff9cdc"`,
    );
    await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "cityId"`);
  }
}
