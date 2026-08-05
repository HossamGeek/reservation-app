import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConstraints1783933071599 implements MigrationInterface {
    name = 'AddUniqueConstraints1783933071599'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cities" DROP CONSTRAINT "FK_cities_country"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP CONSTRAINT "FK_providers_reviewedById"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP CONSTRAINT "FK_providers_createdById"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_services_categoryId_categories_id"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_services_logoId_documents_id"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_services_serviceTypeId_service_types_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cities_countryId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_languages_nameAr"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_languages_nameEn"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_languages_isActive"`);
        await queryRunner.query(`ALTER TABLE "cities" DROP CONSTRAINT "UQ_cities_nameEn_countryId"`);
        await queryRunner.query(`ALTER TABLE "cities" DROP CONSTRAINT "UQ_cities_nameAr_countryId"`);

        // Clean up duplicates before adding unique constraints
        // 1. Update cities pointing to duplicate countries to point to the kept country (MIN id)
        await queryRunner.query(`
          UPDATE "cities"
          SET "countryId" = kept.keep_id
          FROM (
            SELECT c.id AS dup_id, m.keep_id
            FROM "countries" c
            JOIN (
              SELECT MIN(id) as keep_id, "nameAr" FROM "countries" GROUP BY "nameAr"
            ) m ON c."nameAr" = m."nameAr"
            WHERE c.id <> m.keep_id
          ) kept
          WHERE "cities"."countryId" = kept.dup_id
        `);
        await queryRunner.query(`
          UPDATE "cities"
          SET "countryId" = kept.keep_id
          FROM (
            SELECT c.id AS dup_id, m.keep_id
            FROM "countries" c
            JOIN (
              SELECT MIN(id) as keep_id, "nameEn" FROM "countries" GROUP BY "nameEn"
            ) m ON c."nameEn" = m."nameEn"
            WHERE c.id <> m.keep_id
          ) kept
          WHERE "cities"."countryId" = kept.dup_id
        `);

        // 2. Update branches pointing to duplicate cities to point to the kept city (MIN id)
        await queryRunner.query(`
          UPDATE "branches"
          SET "cityId" = kept.keep_id
          FROM (
            SELECT c.id AS dup_id, m.keep_id
            FROM "cities" c
            JOIN (
              SELECT MIN(id) as keep_id, "countryId", "nameAr" FROM "cities" GROUP BY "countryId", "nameAr"
            ) m ON c."nameAr" = m."nameAr" AND c."countryId" = m."countryId"
            WHERE c.id <> m.keep_id
          ) kept
          WHERE "branches"."cityId" = kept.dup_id
        `);
        await queryRunner.query(`
          UPDATE "branches"
          SET "cityId" = kept.keep_id
          FROM (
            SELECT c.id AS dup_id, m.keep_id
            FROM "cities" c
            JOIN (
              SELECT MIN(id) as keep_id, "countryId", "nameEn" FROM "cities" GROUP BY "countryId", "nameEn"
            ) m ON c."nameEn" = m."nameEn" AND c."countryId" = m."countryId"
            WHERE c.id <> m.keep_id
          ) kept
          WHERE "branches"."cityId" = kept.dup_id
        `);

        // 3. Now delete the duplicates
        await queryRunner.query(`DELETE FROM "countries" WHERE id NOT IN (SELECT MIN(id) FROM "countries" GROUP BY "nameAr")`);
        await queryRunner.query(`DELETE FROM "countries" WHERE id NOT IN (SELECT MIN(id) FROM "countries" GROUP BY "nameEn")`);
        await queryRunner.query(`DELETE FROM "nationalities" WHERE id NOT IN (SELECT MIN(id) FROM "nationalities" GROUP BY "nameAr")`);
        await queryRunner.query(`DELETE FROM "nationalities" WHERE id NOT IN (SELECT MIN(id) FROM "nationalities" GROUP BY "nameEn")`);
        await queryRunner.query(`DELETE FROM "religions" WHERE id NOT IN (SELECT MIN(id) FROM "religions" GROUP BY "nameAr")`);
        await queryRunner.query(`DELETE FROM "religions" WHERE id NOT IN (SELECT MIN(id) FROM "religions" GROUP BY "nameEn")`);
        await queryRunner.query(`DELETE FROM "positions" WHERE id NOT IN (SELECT MIN(id) FROM "positions" GROUP BY "nameAr")`);
        await queryRunner.query(`DELETE FROM "positions" WHERE id NOT IN (SELECT MIN(id) FROM "positions" GROUP BY "nameEn")`);
        await queryRunner.query(`DELETE FROM "cities" WHERE id NOT IN (SELECT MIN(id) FROM "cities" GROUP BY "countryId", "nameAr")`);
        await queryRunner.query(`DELETE FROM "cities" WHERE id NOT IN (SELECT MIN(id) FROM "cities" GROUP BY "countryId", "nameEn")`);

        await queryRunner.query(`ALTER TABLE "countries" ADD CONSTRAINT "UQ_59bf79f37ac3711534a000d31aa" UNIQUE ("nameEn")`);
        await queryRunner.query(`ALTER TABLE "countries" ADD CONSTRAINT "UQ_826d6cff39e849fe0fa5de33daa" UNIQUE ("nameAr")`);
        await queryRunner.query(`ALTER TABLE "service_type_options" DROP CONSTRAINT "FK_8970d60ef767885f6ff95ba81f3"`);
        await queryRunner.query(`ALTER TABLE "service_type_options" ALTER COLUMN "serviceTypeId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "UQ_a1ae2b18342a1bae0c4c4fffd88" UNIQUE ("logoId")`);
        await queryRunner.query(`ALTER TABLE "religions" ADD CONSTRAINT "UQ_2de16ea5c853dad3f9e9b220e99" UNIQUE ("nameEn")`);
        await queryRunner.query(`ALTER TABLE "religions" ADD CONSTRAINT "UQ_be7db954a7daa2f3f961094be68" UNIQUE ("nameAr")`);
        await queryRunner.query(`ALTER TABLE "positions" ADD CONSTRAINT "UQ_8cb637c883643d7d0e1a98670e2" UNIQUE ("nameEn")`);
        await queryRunner.query(`ALTER TABLE "positions" ADD CONSTRAINT "UQ_679530de2634a807c091633e380" UNIQUE ("nameAr")`);
        await queryRunner.query(`ALTER TABLE "nationalities" ADD CONSTRAINT "UQ_2134d24a63354f9005c69539265" UNIQUE ("nameEn")`);
        await queryRunner.query(`ALTER TABLE "nationalities" ADD CONSTRAINT "UQ_c8d78c28e8231ad1890477d9fdb" UNIQUE ("nameAr")`);
        await queryRunner.query(`ALTER TABLE "cities" ADD CONSTRAINT "UQ_9412795973e23810d121d72f6b4" UNIQUE ("countryId", "nameEn")`);
        await queryRunner.query(`ALTER TABLE "cities" ADD CONSTRAINT "UQ_5f27a3ce75e531df50d9d7d2d7e" UNIQUE ("countryId", "nameAr")`);
        await queryRunner.query(`ALTER TABLE "cities" ADD CONSTRAINT "FK_b5f9bef6e3609b50aac3e103ab3" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "providers" ADD CONSTRAINT "FK_6c9d2973e19e66bb982814d44b6" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "providers" ADD CONSTRAINT "FK_bd81ff3ce564cd65b46baa2daec" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "service_type_options" ADD CONSTRAINT "FK_8970d60ef767885f6ff95ba81f3" FOREIGN KEY ("serviceTypeId") REFERENCES "service_types"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_034b52310c2d211bc979c3cc4e8" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_3b497fc81dabff33fffd6d91cc4" FOREIGN KEY ("serviceTypeId") REFERENCES "service_types"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_a1ae2b18342a1bae0c4c4fffd88" FOREIGN KEY ("logoId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_a1ae2b18342a1bae0c4c4fffd88"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_3b497fc81dabff33fffd6d91cc4"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_034b52310c2d211bc979c3cc4e8"`);
        await queryRunner.query(`ALTER TABLE "service_type_options" DROP CONSTRAINT "FK_8970d60ef767885f6ff95ba81f3"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP CONSTRAINT "FK_bd81ff3ce564cd65b46baa2daec"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP CONSTRAINT "FK_6c9d2973e19e66bb982814d44b6"`);
        await queryRunner.query(`ALTER TABLE "cities" DROP CONSTRAINT "FK_b5f9bef6e3609b50aac3e103ab3"`);
        await queryRunner.query(`ALTER TABLE "cities" DROP CONSTRAINT "UQ_5f27a3ce75e531df50d9d7d2d7e"`);
        await queryRunner.query(`ALTER TABLE "cities" DROP CONSTRAINT "UQ_9412795973e23810d121d72f6b4"`);
        await queryRunner.query(`ALTER TABLE "nationalities" DROP CONSTRAINT "UQ_c8d78c28e8231ad1890477d9fdb"`);
        await queryRunner.query(`ALTER TABLE "nationalities" DROP CONSTRAINT "UQ_2134d24a63354f9005c69539265"`);
        await queryRunner.query(`ALTER TABLE "positions" DROP CONSTRAINT "UQ_679530de2634a807c091633e380"`);
        await queryRunner.query(`ALTER TABLE "positions" DROP CONSTRAINT "UQ_8cb637c883643d7d0e1a98670e2"`);
        await queryRunner.query(`ALTER TABLE "religions" DROP CONSTRAINT "UQ_be7db954a7daa2f3f961094be68"`);
        await queryRunner.query(`ALTER TABLE "religions" DROP CONSTRAINT "UQ_2de16ea5c853dad3f9e9b220e99"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "UQ_a1ae2b18342a1bae0c4c4fffd88"`);
        await queryRunner.query(`ALTER TABLE "service_type_options" ALTER COLUMN "serviceTypeId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_type_options" ADD CONSTRAINT "FK_8970d60ef767885f6ff95ba81f3" FOREIGN KEY ("serviceTypeId") REFERENCES "service_types"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "countries" DROP CONSTRAINT "UQ_826d6cff39e849fe0fa5de33daa"`);
        await queryRunner.query(`ALTER TABLE "countries" DROP CONSTRAINT "UQ_59bf79f37ac3711534a000d31aa"`);
        await queryRunner.query(`ALTER TABLE "cities" ADD CONSTRAINT "UQ_cities_nameAr_countryId" UNIQUE ("nameAr", "countryId")`);
        await queryRunner.query(`ALTER TABLE "cities" ADD CONSTRAINT "UQ_cities_nameEn_countryId" UNIQUE ("nameEn", "countryId")`);
        await queryRunner.query(`CREATE INDEX "IDX_languages_isActive" ON "languages" ("isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_languages_nameEn" ON "languages" ("nameEn") `);
        await queryRunner.query(`CREATE INDEX "IDX_languages_nameAr" ON "languages" ("nameAr") `);
        await queryRunner.query(`CREATE INDEX "IDX_cities_countryId" ON "cities" ("countryId") `);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_services_serviceTypeId_service_types_id" FOREIGN KEY ("serviceTypeId") REFERENCES "service_types"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_services_logoId_documents_id" FOREIGN KEY ("logoId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_services_categoryId_categories_id" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "providers" ADD CONSTRAINT "FK_providers_createdById" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "providers" ADD CONSTRAINT "FK_providers_reviewedById" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "cities" ADD CONSTRAINT "FK_cities_country" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
