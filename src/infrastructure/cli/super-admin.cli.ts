import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { dataSource } from '../database/datasource';
import { encodePassword } from 'src/libs/utils/bcrypt';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { UserStatusEnum } from 'src/libs/enums/user-status.enum';

@Command({
  name: 'create:admin',
  description: 'Generate migration to create or update the Super Admin user',
})
export class UpdateSuperAdminUserCli extends CommandRunner {
  async run(): Promise<void> {
    await dataSource.initialize();

    try {
      const ts = Date.now();
      const migrationName = `SuperAdmin${ts}`;

      const migrationDir = path.join(
        process.cwd(),
        'src',
        'infrastructure',
        'database',
        'migrations',
      );

      const filePath = path.join(migrationDir, `${ts}-super-admin.ts`);

      const hashedPassword = await encodePassword('12345678');

      const migrationContent = `
import { MigrationInterface, QueryRunner } from 'typeorm';

export class ${migrationName} implements MigrationInterface {
  name = '${migrationName}';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(\`
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
        '${hashedPassword}',
        '${UserTypeEnum.ADMIN}',
        '${UserStatusEnum.ACTIVE}',
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
    \`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(\`
      DELETE FROM users
      WHERE email = 'super.admin@ERP.com';
    \`);
  }
}
`.trim();

      if (!fs.existsSync(migrationDir)) {
        fs.mkdirSync(migrationDir, { recursive: true });
      }

      fs.writeFileSync(filePath, migrationContent);

      Logger.log(`✅ Migration generated: ${filePath}`);
    } catch (error) {
      Logger.error(error);
      throw error;
    } finally {
      await dataSource.destroy();
    }
  }
}
