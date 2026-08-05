import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocumentsTable1782030500000 implements MigrationInterface {
  name = 'CreateDocumentsTable1782030500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "documents" (
        "id" BIGSERIAL NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
        "entityType" character varying(50),
        "entityId" bigint,
        "documentType" character varying(50) NOT NULL,
        "fileName" character varying(255) NOT NULL,
        "fileSize" bigint NOT NULL,
        "fileType" character varying(10) NOT NULL,
        "verifiedById" bigint,
        "verifiedAt" TIMESTAMP,
        "isUsed" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_documents" PRIMARY KEY ("id"),
        CONSTRAINT "FK_documents_verifiedBy" FOREIGN KEY ("verifiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_documents_entity" ON "documents" ("entityType", "entityId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_documents_type" ON "documents" ("documentType")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_documents_type"`);
    await queryRunner.query(`DROP INDEX "IDX_documents_entity"`);
    await queryRunner.query(`DROP TABLE "documents"`);
  }
}
