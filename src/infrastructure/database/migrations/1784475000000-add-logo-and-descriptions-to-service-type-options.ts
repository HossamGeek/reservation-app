import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLogoAndDescriptionsToServiceTypeOptions1784475000000
  implements MigrationInterface
{
  name = 'AddLogoAndDescriptionsToServiceTypeOptions1784475000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_type_options" ADD "descriptionEn" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_type_options" ADD "descriptionAr" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_type_options" ADD "logoId" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_type_options" ADD CONSTRAINT "FK_service_type_options_logoId_documents_id" FOREIGN KEY ("logoId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_type_options" DROP CONSTRAINT "FK_service_type_options_logoId_documents_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_type_options" DROP COLUMN "logoId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_type_options" DROP COLUMN "descriptionAr"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_type_options" DROP COLUMN "descriptionEn"`,
    );
  }
}
