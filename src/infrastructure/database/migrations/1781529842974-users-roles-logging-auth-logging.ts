import { MigrationInterface, QueryRunner } from "typeorm";

export class UsersRolesLoggingAuthLogging1781529842974 implements MigrationInterface {
    name = 'UsersRolesLoggingAuthLogging1781529842974'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "auth_logging" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "userId" bigint NOT NULL, "uuid" character varying, "type" smallint NOT NULL, "ipAddress" character varying, "userAgent" character varying, CONSTRAINT "PK_49437166b6bccd999c0e96dd877" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_USER_LOGGING_INDEX" ON "auth_logging" ("userId", "type", "uuid") `);
        await queryRunner.query(`CREATE TABLE "roles" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "name" character varying(255) NOT NULL, "isSystemRole" boolean NOT NULL DEFAULT false, "permissions" jsonb NOT NULL, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "email" character varying NOT NULL, "password" character varying NOT NULL, "type" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "phoneNumber" character varying NOT NULL, "image" character varying, "roleId" bigint, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "logging" ("id" BIGSERIAL NOT NULL, "actionableEntity" character varying NOT NULL, "actionableId" character varying(50), "params" jsonb, "body" jsonb, "action" character varying NOT NULL, "slug" character varying(40) NOT NULL DEFAULT '', "ip" character varying(45) NOT NULL, "userId" character varying NOT NULL, "authorized" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_2b6eefd2a39237bdb7e3545fa55" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "logging_category_idx" ON "logging" ("actionableEntity") `);
        await queryRunner.query(`CREATE INDEX "logging_user_idx" ON "logging" ("userId") `);
        await queryRunner.query(`CREATE INDEX "logging_created_at_idx" ON "logging" ("created_at") `);
        await queryRunner.query(`ALTER TABLE "auth_logging" ADD CONSTRAINT "FK_afe9f66a8c290e5e819b2630bb6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_368e146b785b574f42ae9e53d5e" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_368e146b785b574f42ae9e53d5e"`);
        await queryRunner.query(`ALTER TABLE "auth_logging" DROP CONSTRAINT "FK_afe9f66a8c290e5e819b2630bb6"`);
        await queryRunner.query(`DROP INDEX "public"."logging_created_at_idx"`);
        await queryRunner.query(`DROP INDEX "public"."logging_user_idx"`);
        await queryRunner.query(`DROP INDEX "public"."logging_category_idx"`);
        await queryRunner.query(`DROP TABLE "logging"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_USER_LOGGING_INDEX"`);
        await queryRunner.query(`DROP TABLE "auth_logging"`);
    }

}
