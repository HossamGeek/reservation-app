import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneAndEmailTypeUniqueConstraintForUsersTable1785417094623 implements MigrationInterface {
  name = 'AddPhoneAndEmailTypeUniqueConstraintForUsersTable1785417094623';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_users_email_type" UNIQUE ("email", "type")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_users_phoneNumber_type" UNIQUE ("phoneNumber", "type")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_users_phoneNumber_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_users_email_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`,
    );
  }
}
