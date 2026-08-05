import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServiceTypeOptionsTable1783408257779 implements MigrationInterface {
  name = 'CreateServiceTypeOptionsTable1783408257779';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "service_type_options" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deletedAt" TIMESTAMP, "nameEn" character varying(255) NOT NULL, "nameAr" character varying(255) NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "serviceTypeId" bigint, CONSTRAINT "UQ_888d76597eb4d88316aad7cbb10" UNIQUE ("nameEn"), CONSTRAINT "UQ_fd579757a12200cfd925773b9d0" UNIQUE ("nameAr"), CONSTRAINT "PK_54b7c949c0c52c5b87ada776918" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_type_options" ADD CONSTRAINT "FK_8970d60ef767885f6ff95ba81f3" FOREIGN KEY ("serviceTypeId") REFERENCES "service_types"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_type_options" DROP CONSTRAINT "FK_8970d60ef767885f6ff95ba81f3"`,
    );
    await queryRunner.query(`DROP TABLE "service_type_options"`);
  }
}
