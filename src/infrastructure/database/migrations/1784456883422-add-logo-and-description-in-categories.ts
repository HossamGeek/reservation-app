import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLogoAndDescriptionInCategories1784456883422 implements MigrationInterface {
    name = 'AddLogoAndDescriptionInCategories1784456883422'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ADD "logoId" bigint`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_3f43543ba2a8716cc5d3dd58ae8" UNIQUE ("logoId")`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "descriptionAr" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "descriptionEn" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_3f43543ba2a8716cc5d3dd58ae8" FOREIGN KEY ("logoId") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_3f43543ba2a8716cc5d3dd58ae8"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "descriptionEn"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "descriptionAr"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_3f43543ba2a8716cc5d3dd58ae8"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "logoId"`);
    }

}
