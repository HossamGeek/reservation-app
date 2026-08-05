import { MigrationInterface, QueryRunner } from 'typeorm';

export class SuperAdmin1785942290846 implements MigrationInterface {
  name = 'SuperAdmin1785942290846';

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
        '$2b$10$qla4PxVUyTrSqcZ0/vnM1.YNc0bgU0Yn4IB.gZtQVWsGy5efmBdj2',
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