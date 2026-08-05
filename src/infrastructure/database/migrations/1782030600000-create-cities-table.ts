import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCitiesTable1782030600000 implements MigrationInterface {
  name = 'CreateCitiesTable1782030600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "cities" (
        "id" BIGSERIAL NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
        "nameEn" character varying(255) NOT NULL,
        "nameAr" character varying(255) NOT NULL,
        "countryId" bigint NOT NULL,
        "isActive" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_cities" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_cities_nameEn_countryId" UNIQUE ("nameEn", "countryId"),
        CONSTRAINT "UQ_cities_nameAr_countryId" UNIQUE ("nameAr", "countryId"),
        CONSTRAINT "FK_cities_country" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_cities_countryId" ON "cities" ("countryId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_cities_countryId"`);
    await queryRunner.query(`DROP TABLE "cities"`);
  }
}
