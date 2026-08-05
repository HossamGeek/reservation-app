import { MigrationInterface, QueryRunner } from 'typeorm';

export class SuperRoleExperiences1782398000000 implements MigrationInterface {
  name = 'SuperRoleExperiences1782398000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE roles
      SET
        permissions = jsonb_set(permissions, '{experiences}', '{"create": true, "listView": true, "update": true}'::jsonb, true)
      WHERE "isSystemRole" = true;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE roles
      SET
        permissions = permissions - 'experiences'
      WHERE "isSystemRole" = true;
    `);
  }
}
