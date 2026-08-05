import { MigrationInterface, QueryRunner } from 'typeorm';

export class SuperAdmin1781530016578 implements MigrationInterface {
  name = 'SuperAdmin1781530016578';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO users (
        email,
        password,
        type,
        status,
        "firstName",
        "lastName",
        "phoneNumber",
        "roleId"
      )
      VALUES (
        'super.admin@ERP.com',
        '$2b$10$/Ga0WW.Hrn1CHrzA6KRxReLUA7wHWBU6Lg0TXS5ciQdYxjOlEDmj.',
        'admin',
        'active',
        'Super',
        'Admin',
        '+201111111111',
        (
          SELECT id
          FROM roles
          WHERE "isSystemRole" = true
          LIMIT 1
        )
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM users
      WHERE email = 'super.admin@ERP.com';
    `);
  }
}