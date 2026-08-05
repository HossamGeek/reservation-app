import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNationalitiesTable1782386365738 implements MigrationInterface {
    name = 'CreateNationalitiesTable1782386365738'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "nationalities" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "nameEn" character varying(255) NOT NULL, "nameAr" character varying(255) NOT NULL, "isActive" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_aaa94322d4f245f4fa3c3d591fd" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "nationalities"`);
    }

}
