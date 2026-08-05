import { MigrationInterface, QueryRunner } from "typeorm";

export class CityMandatoryInBranch1784701535839 implements MigrationInterface {
    name = 'CityMandatoryInBranch1784701535839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "branches" ALTER COLUMN "cityId" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "branches" ALTER COLUMN "cityId" SET NOT NULL`);
    }

}
