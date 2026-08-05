import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameCountryLogoToCode1781693290000 implements MigrationInterface {
  name = 'RenameCountryLogoToCode1781693290000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Rename column 'logo' to 'code'
    await queryRunner.query(
      `ALTER TABLE "countries" RENAME COLUMN "logo" TO "code"`,
    );

    // 2. Clean up existing flag URLs in the column to store just the 2-letter code
    await queryRunner.query(
      `UPDATE "countries" 
       SET "code" = substring("code" from 'https://flagsapi.com/([A-Z]{2})/flat/64.png')
       WHERE "code" LIKE 'https://flagsapi.com/%'`,
    );

    // 3. Alter column type to varchar(2)
    await queryRunner.query(
      `ALTER TABLE "countries" ALTER COLUMN "code" TYPE character varying(2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Alter column type back to varchar(255)
    await queryRunner.query(
      `ALTER TABLE "countries" ALTER COLUMN "code" TYPE character varying(255)`,
    );

    // 2. Restore the code column value back to the full flag URL
    await queryRunner.query(
      `UPDATE "countries"
       SET "code" = 'https://flagsapi.com/' || "code" || '/flat/64.png'
       WHERE "code" IS NOT NULL AND length("code") = 2`,
    );

    // 3. Rename 'code' column back to 'logo'
    await queryRunner.query(
      `ALTER TABLE "countries" RENAME COLUMN "code" TO "logo"`,
    );
  }
}
