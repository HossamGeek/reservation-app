import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';

import { dataSource } from '../database/datasource';
import {
  CategoriesEnum,
  systemPermission,
} from 'src/libs/enums/permission.enum';
import { SUPER_ADMIN_ROLE_NAME } from 'src/libs/constants/global-constants';

@Command({
  name: 'check:super-role',
  description: 'Generate migration to create or update the Super Admin role',
})
export class UpdateSuperAdminRoleCli extends CommandRunner {
  async run(): Promise<void> {
    await dataSource.initialize();

    try {
      const ts = Date.now();
      const migrationName = `SuperRole${ts}`;

      const migrationDir = path.join(
        process.cwd(),
        'src',
        'infrastructure',
        'database',
        'migrations',
      );

      const filePath = path.join(migrationDir, `${ts}-super-role.ts`);

      const existingRole = await dataSource.query(`
                                                    SELECT id
                                                    FROM roles
                                                    WHERE "isSystemRole" = true
                                                    LIMIT 1;
                                                  `);

      const superAdminPermissions = Object.keys(systemPermission).reduce(
        (acc, category) => {
          acc[category] = Object.keys(
            systemPermission[category as CategoriesEnum],
          ).reduce(
            (actions, action) => {
              actions[action] = true;
              return actions;
            },
            {} as Record<string, boolean>,
          );

          return acc;
        },
        {} as Record<string, Record<string, boolean>>,
      );

      const permissionsJson = JSON.stringify(superAdminPermissions).replace(
        /'/g,
        "''",
      );

      const upQuery =
        existingRole.length > 0
          ? `
      UPDATE roles
      SET
        name = '${SUPER_ADMIN_ROLE_NAME}',
        permissions = '${permissionsJson}'::jsonb
      WHERE "isSystemRole" = true;
    `
          : `
      INSERT INTO roles (
        name,
        "isSystemRole",
        permissions
      )
      VALUES (
        '${SUPER_ADMIN_ROLE_NAME}',
        true,
        '${permissionsJson}'::jsonb
      );
    `;

      const migrationContent = `
import { MigrationInterface, QueryRunner } from 'typeorm';

export class ${migrationName} implements MigrationInterface {
  name = '${migrationName}';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(\`
${upQuery}
    \`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(\`
      DELETE FROM roles
      WHERE name = '${SUPER_ADMIN_ROLE_NAME}'
        AND "isSystemRole" = true;
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
