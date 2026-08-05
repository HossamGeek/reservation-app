import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBranchesTable1782306265883 implements MigrationInterface {
  name = 'CreateBranchesTable1782306265883';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "branches" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deletedAt" TIMESTAMP, "nameAr" character varying(255) NOT NULL, "nameEn" character varying(255) NOT NULL, "addressAr" character varying(255) NOT NULL, "addressEn" character varying(255) NOT NULL, "isMainBranch" boolean NOT NULL DEFAULT false, "cityId" bigint NOT NULL, "providerId" bigint NOT NULL, CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_BRANCH_CITY" ON "branches" ("cityId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_BRANCH_PROVIDER" ON "branches" ("providerId") `,
    );
    await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "addressAr"`);
    await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "addressEn"`);
    await queryRunner.query(
      `ALTER TABLE "branches" ADD CONSTRAINT "FK_0640f3fc46b8ed057fbbf60525d" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "branches" DROP CONSTRAINT "FK_0640f3fc46b8ed057fbbf60525d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "addressEn" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "providers" ADD "addressAr" character varying(255) NOT NULL`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_BRANCH_PROVIDER"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_BRANCH_CITY"`);
    await queryRunner.query(`DROP TABLE "branches"`);
  }
}
