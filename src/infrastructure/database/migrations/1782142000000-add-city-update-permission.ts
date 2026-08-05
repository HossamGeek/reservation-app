import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCityUpdatePermission1782142000000 implements MigrationInterface {
  name = 'AddCityUpdatePermission1782142000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE roles
      SET
        permissions = jsonb_set(permissions, '{cities,update}', 'true'::jsonb)
      WHERE "isSystemRole" = true;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE roles
      SET
        permissions = permissions #- '{cities,update}'
      WHERE "isSystemRole" = true;
    `);
  }
}
