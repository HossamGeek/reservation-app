import { MigrationInterface, QueryRunner } from 'typeorm';

export class SuperRole1781529987817 implements MigrationInterface {
  name = 'SuperRole1781529987817';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`

      INSERT INTO roles (
        name,
        "isSystemRole",
        permissions
      )
      VALUES (
        'Super Admin',
        true,
        '{"roles":{"listView":true,"detailedView":true,"create":true,"update":true,"restore":true,"delete":true},"users":{"listView":true,"detailedView":true,"create":true,"update":true,"restore":true,"delete":true}}'::jsonb
      );
    
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