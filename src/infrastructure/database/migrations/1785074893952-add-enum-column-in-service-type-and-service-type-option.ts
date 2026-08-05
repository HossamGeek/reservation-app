import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEnumColumnInServiceTypeAndServiceTypeOption1785074893952 implements MigrationInterface {
  name = 'AddEnumColumnInServiceTypeAndServiceTypeOption1785074893952';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."service_type_options_type_enum" AS ENUM('SINGLE_VISIT', 'MULTI_VISIT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_type_options" ADD "type" "public"."service_type_options_type_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."service_types_type_enum" AS ENUM('HOURLY', 'LIVE_IN', 'RECRUITMENT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_types" ADD "type" "public"."service_types_type_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "service_types" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."service_types_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "service_type_options" DROP COLUMN "type"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."service_type_options_type_enum"`,
    );
  }
}
