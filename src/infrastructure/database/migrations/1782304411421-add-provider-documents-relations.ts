import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProviderDocumentsRelations1782304411421 implements MigrationInterface {
  name = 'AddProviderDocumentsRelations1782304411421';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "documents" DROP CONSTRAINT "FK_documents_verifiedBy"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_documents_type"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_documents_entity"`);
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "nameAr" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "nameEn" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "commercialRegistrationNumber" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "recruitmentLicenseNumber" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "addressAr" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "addressEn" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "status" character varying(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "commercialRegistrationDocumentId" bigint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD CONSTRAINT "UQ_c2e9306173a585fca839e04c4b5" UNIQUE ("commercialRegistrationDocumentId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "recruitmentLicenseDocumentId" bigint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD CONSTRAINT "UQ_ec550376725ed842ec43873d479" UNIQUE ("recruitmentLicenseDocumentId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "nationalAddressProofDocumentId" bigint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD CONSTRAINT "UQ_f5a83b7d8cf598c2d77f20e7aef" UNIQUE ("nationalAddressProofDocumentId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "ibanCertificateDocumentId" bigint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD CONSTRAINT "UQ_9f37f5f5bbe600391fa762f2994" UNIQUE ("ibanCertificateDocumentId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "vatCertificateDocumentId" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD CONSTRAINT "UQ_0a3828662a3107c48fd3f00dbf1" UNIQUE ("vatCertificateDocumentId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ff0439fe04f8e0c6ea2bdfebbb" ON "documents" ("documentType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_95476c2fe1b629671d3e6e7514" ON "documents" ("entityType", "entityId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD CONSTRAINT "FK_1f9c6f9df308860d471c9bbec34" FOREIGN KEY ("verifiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD CONSTRAINT "FK_c2e9306173a585fca839e04c4b5" FOREIGN KEY ("commercialRegistrationDocumentId") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD CONSTRAINT "FK_ec550376725ed842ec43873d479" FOREIGN KEY ("recruitmentLicenseDocumentId") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD CONSTRAINT "FK_f5a83b7d8cf598c2d77f20e7aef" FOREIGN KEY ("nationalAddressProofDocumentId") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD CONSTRAINT "FK_9f37f5f5bbe600391fa762f2994" FOREIGN KEY ("ibanCertificateDocumentId") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD CONSTRAINT "FK_0a3828662a3107c48fd3f00dbf1" FOREIGN KEY ("vatCertificateDocumentId") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "providers" DROP CONSTRAINT "FK_0a3828662a3107c48fd3f00dbf1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" DROP CONSTRAINT "FK_9f37f5f5bbe600391fa762f2994"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" DROP CONSTRAINT "FK_f5a83b7d8cf598c2d77f20e7aef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" DROP CONSTRAINT "FK_ec550376725ed842ec43873d479"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" DROP CONSTRAINT "FK_c2e9306173a585fca839e04c4b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" DROP CONSTRAINT "FK_1f9c6f9df308860d471c9bbec34"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_95476c2fe1b629671d3e6e7514"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ff0439fe04f8e0c6ea2bdfebbb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" DROP CONSTRAINT "UQ_0a3828662a3107c48fd3f00dbf1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" DROP COLUMN "vatCertificateDocumentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" DROP CONSTRAINT "UQ_9f37f5f5bbe600391fa762f2994"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" DROP COLUMN "ibanCertificateDocumentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" DROP CONSTRAINT "UQ_f5a83b7d8cf598c2d77f20e7aef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" DROP COLUMN "nationalAddressProofDocumentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" DROP CONSTRAINT "UQ_ec550376725ed842ec43873d479"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" DROP COLUMN "recruitmentLicenseDocumentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" DROP CONSTRAINT "UQ_c2e9306173a585fca839e04c4b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" DROP COLUMN "commercialRegistrationDocumentId"`,
    );
    await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "status"`);
    await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "addressEn"`);
    await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "addressAr"`);
    await queryRunner.query(
      `ALTER TABLE "providers" DROP COLUMN "recruitmentLicenseNumber"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" DROP COLUMN "commercialRegistrationNumber"`,
    );
    await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "nameEn"`);
    await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "nameAr"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_documents_entity" ON "documents" ("entityId", "entityType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_documents_type" ON "documents" ("documentType") `,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD CONSTRAINT "FK_documents_verifiedBy" FOREIGN KEY ("verifiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }
}
