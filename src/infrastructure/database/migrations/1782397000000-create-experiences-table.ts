import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateExperiencesTable1782397000000 implements MigrationInterface {
    name = 'CreateExperiencesTable1782397000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "experiences" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deletedAt" TIMESTAMP, "minYears" smallint NOT NULL, "maxYears" smallint, "isActive" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_experiences_id" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "experiences"`);
    }
}
