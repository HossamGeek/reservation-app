import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOriginalFileNameToDocument1784463674340 implements MigrationInterface {
  name = 'AddOriginalFileNameToDocument1784463674340';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "documents" ADD "originalFileName" character varying(255)`,
    );
    await queryRunner.query(
      `UPDATE "documents" SET "originalFileName" = "fileName" WHERE "originalFileName" IS NULL;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "documents" DROP COLUMN "originalFileName"`,
    );
  }
}
