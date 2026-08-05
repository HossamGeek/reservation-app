import { Exclude, Expose } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { Permissions } from 'src/libs/enums/permission.enum';
import { AbstractEntity } from 'src/libs/entities/abstract.entity';
import { convertToFrontendPermission } from 'src/libs/transformers/permissions.transformer';

@Entity({ name: 'roles' })
export class RoleEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Exclude()
  @Column({ type: 'boolean', default: false })
  isSystemRole: boolean;

  @Exclude()
  @Column({ type: 'jsonb' })
  permissions: Permissions;

  @Expose({ name: 'permissions' })
  getPermissions() {
    return convertToFrontendPermission(this.permissions);
  }
}
