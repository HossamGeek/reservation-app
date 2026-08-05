import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCountriesTable1781690071972 implements MigrationInterface {
    name = 'CreateCountriesTable1781690071972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "countries" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "nameEn" character varying(255) NOT NULL, "nameAr" character varying(255) NOT NULL, "logo" character varying(255), "isActive" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_b2d7006793e8697ab3ae2deff18" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "countries"`);
    }

}
