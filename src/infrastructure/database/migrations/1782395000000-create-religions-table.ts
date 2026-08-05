import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReligionsTable1782395000000 implements MigrationInterface {
    name = 'CreateReligionsTable1782395000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "religions" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deletedAt" TIMESTAMP, "nameEn" character varying(255) NOT NULL, "nameAr" character varying(255) NOT NULL, "isActive" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_religions_id" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "religions"`);
    }
}
