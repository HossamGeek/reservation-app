import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1782633581009 implements MigrationInterface {
    name = 'Migrations1782633581009'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "nationalities" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "nameEn" character varying(255) NOT NULL, "nameAr" character varying(255) NOT NULL, "isActive" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_aaa94322d4f245f4fa3c3d591fd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cities" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "nameEn" character varying(255) NOT NULL, "nameAr" character varying(255) NOT NULL, "countryId" bigint NOT NULL, "isActive" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_4762ffb6e5d198cfec5606bc11e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "cities" ADD CONSTRAINT "FK_b5f9bef6e3609b50aac3e103ab3" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cities" DROP CONSTRAINT "FK_b5f9bef6e3609b50aac3e103ab3"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`DROP TABLE "cities"`);
        await queryRunner.query(`DROP TABLE "nationalities"`);
    }

}
