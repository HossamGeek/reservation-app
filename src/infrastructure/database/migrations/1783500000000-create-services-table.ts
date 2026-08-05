import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServicesTable1783500000000 implements MigrationInterface {
  name = 'CreateServicesTable1783500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "services" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deletedAt" TIMESTAMP, "categoryId" bigint, "serviceTypeId" bigint, "nameAr" character varying(255) NOT NULL UNIQUE, "nameEn" character varying(255) NOT NULL UNIQUE, "descriptionAr" character varying(255) NOT NULL, "descriptionEn" character varying(255) NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "logoId" bigint, CONSTRAINT "PK_services_id" PRIMARY KEY ("id"), CONSTRAINT "FK_services_categoryId_categories_id" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "FK_services_serviceTypeId_service_types_id" FOREIGN KEY ("serviceTypeId") REFERENCES "service_types"("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "FK_services_logoId_documents_id" FOREIGN KEY ("logoId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "services"`);
  }
}
