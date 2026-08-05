import { MigrationInterface, QueryRunner } from 'typeorm';

export class SuperRole1783500728749 implements MigrationInterface {
  name = 'SuperRole1783500728749';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`

      UPDATE roles
      SET
        name = 'Super Admin',
        permissions = '{"roles":{"listView":true,"detailedView":true,"create":true,"update":true,"restore":true,"delete":true},"users":{"listView":true,"detailedView":true,"create":true,"update":true,"restore":true,"delete":true},"countries":{"listView":true,"update":true},"cities":{"listView":true,"detailedView":true,"update":true},"nationalities":{"create":true,"listView":true,"update":true},"providers":{"listView":true,"detailedView":true,"create":true,"update":true,"restore":true,"delete":true,"review":true},"positions":{"create":true,"listView":true,"update":true},"religions":{"create":true,"listView":true,"update":true},"experiences":{"create":true,"listView":true,"update":true},"skills":{"listView":true,"create":true,"update":true},"languages":{"listView":true,"create":true,"update":true},"documents":{"update":true},"categories":{"listView":true,"create":true,"update":true,"delete":true},"serviceTypes":{"listView":true,"update":true},"serviceTypeOptions":{"create":true,"update":true}}'::jsonb
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