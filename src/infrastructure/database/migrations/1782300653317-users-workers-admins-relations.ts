import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersWorkersAdminsRelations1782300653317 implements MigrationInterface {
  name = 'UsersWorkersAdminsRelations1782300653317';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clients" ADD "userId" bigint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" ADD CONSTRAINT "UQ_59c1e5e51addd6ebebf76230b37" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "system-admins" ADD "userId" bigint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "system-admins" ADD CONSTRAINT "UQ_aa657c2ea0f4f28d1e9b307c482" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider-admins" ADD "userId" bigint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider-admins" ADD CONSTRAINT "UQ_c5ad90f57cecad4d83819d21974" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers" ADD "userId" bigint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers" ADD CONSTRAINT "UQ_fdefd9252e90173f66271f76b96" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" ADD CONSTRAINT "FK_59c1e5e51addd6ebebf76230b37" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "system-admins" ADD CONSTRAINT "FK_aa657c2ea0f4f28d1e9b307c482" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider-admins" ADD CONSTRAINT "FK_c5ad90f57cecad4d83819d21974" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers" ADD CONSTRAINT "FK_fdefd9252e90173f66271f76b96" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workers" DROP CONSTRAINT "FK_fdefd9252e90173f66271f76b96"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider-admins" DROP CONSTRAINT "FK_c5ad90f57cecad4d83819d21974"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system-admins" DROP CONSTRAINT "FK_aa657c2ea0f4f28d1e9b307c482"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" DROP CONSTRAINT "FK_59c1e5e51addd6ebebf76230b37"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers" DROP CONSTRAINT "UQ_fdefd9252e90173f66271f76b96"`,
    );
    await queryRunner.query(`ALTER TABLE "workers" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "provider-admins" DROP CONSTRAINT "UQ_c5ad90f57cecad4d83819d21974"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider-admins" DROP COLUMN "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system-admins" DROP CONSTRAINT "UQ_aa657c2ea0f4f28d1e9b307c482"`,
    );
    await queryRunner.query(`ALTER TABLE "system-admins" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "clients" DROP CONSTRAINT "UQ_59c1e5e51addd6ebebf76230b37"`,
    );
    await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "userId"`);
  }
}
