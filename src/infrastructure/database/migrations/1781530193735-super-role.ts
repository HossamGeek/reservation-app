import { MigrationInterface, QueryRunner } from 'typeorm';

export class SuperRole1781530193735 implements MigrationInterface {
  name = 'SuperRole1781530193735';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`

      UPDATE roles
      SET
        name = 'Super Admin',
        permissions = '{"roles":{"listView":true,"detailedView":true,"create":true,"update":true,"restore":true,"delete":true},"users":{"listView":true,"detailedView":true,"create":true,"update":true,"restore":true,"delete":true}}'::jsonb
      WHERE "isSystemRole" = true;
    
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM roles
      WHERE name = 'Super Admin'
        AND "isSystemRole" = true;
    `);
  }
}