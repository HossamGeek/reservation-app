import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProviderAdminRelation1782302294775 implements MigrationInterface {
  name = 'AddProviderAdminRelation1782302294775';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider-admins" ADD "isOwner" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider-admins" ADD "providerId" bigint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider-admins" ADD CONSTRAINT "FK_f5a5a93735417036463a0f85a1d" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider-admins" DROP CONSTRAINT "FK_f5a5a93735417036463a0f85a1d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider-admins" DROP COLUMN "providerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider-admins" DROP COLUMN "isOwner"`,
    );
  }
}
