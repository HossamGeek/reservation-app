import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAddressToProvider1782311956188 implements MigrationInterface {
  name = 'AddAddressToProvider1782311956188';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "addressAr" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "addressEn" character varying(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "addressEn"`);
    await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "addressAr"`);
  }
}
