import { MigrationInterface, QueryRunner } from 'typeorm';

export class SuperRoleReligions1782396000000 implements MigrationInterface {
  name = 'SuperRoleReligions1782396000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE roles
      SET
        permissions = jsonb_set(permissions, '{religions}', '{"create": true, "listView": true, "update": true}'::jsonb, true)
      WHERE "isSystemRole" = true;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE roles
      SET
        permissions = permissions - 'religions'
      WHERE "isSystemRole" = true;
    `);
  }
}
