import { MigrationInterface, QueryRunner } from 'typeorm';

export class SuperRolePositions1782394000000 implements MigrationInterface {
  name = 'SuperRolePositions1782394000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE roles
      SET
        permissions = jsonb_set(permissions, '{positions}', '{"create": true, "listView": true, "update": true}'::jsonb, true)
      WHERE "isSystemRole" = true;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE roles
      SET
        permissions = permissions - 'positions'
      WHERE "isSystemRole" = true;
    `);
  }
}
