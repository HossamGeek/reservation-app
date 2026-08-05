import { MigrationInterface, QueryRunner } from 'typeorm';

export class SuperRole1782392043576 implements MigrationInterface {
  name = 'SuperRole1782392043576';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`

      UPDATE roles
      SET
        name = 'Super Admin',
        permissions = '{"roles":{"listView":true,"detailedView":true,"create":true,"update":true,"restore":true,"delete":true},"users":{"listView":true,"detailedView":true,"create":true,"update":true,"restore":true,"delete":true},"countries":{"listView":true,"update":true},"cities":{"listView":true,"detailedView":true,"update":true},"nationalities":{"create":true,"listView":true,"update":true}}'::jsonb
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