import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakePasswordAndEmailNullable1783932253491 implements MigrationInterface {
  name = 'MakePasswordAndEmailNullable1783932253491';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL;`);
  }
}
