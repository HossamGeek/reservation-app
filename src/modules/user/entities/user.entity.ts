import { Exclude } from 'class-transformer';
import { AbstractEntityWithDeletedAt } from 'src/libs/entities/abstract.entity';
import { AuthLoggingEntity } from 'src/modules/auth/entities/auth-logging.entity';
import { RoleEntity } from 'src/modules/role/entities/role.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  Unique,
} from 'typeorm';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { UserStatusEnum } from 'src/libs/enums/user-status.enum';
import { ClientEntity } from 'src/modules/client/entities/client.entity';
import { WorkerEntity } from './worker.entity';
import { SystemAdminEntity } from './system-admin.entity';
import { ProviderAdminEntity } from './provider-admin.entity';

@Unique('UQ_users_email_type', ['email', 'type'])
@Unique('UQ_users_phoneNumber_type', ['phoneNumber', 'type'])
@Entity({ name: 'users' })
export class UserEntity extends AbstractEntityWithDeletedAt {
  @Column({ type: 'varchar', nullable: true })
  email?: string | null;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  password?: string | null;

  @Column({ type: 'varchar' })
  type: UserTypeEnum;

  @Column({ type: 'varchar', default: UserStatusEnum.PENDING })
  status: UserStatusEnum;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar' })
  phoneNumber: string;

  @Column({ type: 'varchar', nullable: true })
  image: string;

  @Exclude()
  @Column({ type: 'bigint', nullable: true })
  roleId?: string | null;

  // Relationships
  @ManyToOne(() => RoleEntity, { onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'roleId' })
  role: RoleEntity | null;

  @OneToMany(() => AuthLoggingEntity, (logging) => logging.user)
  authLogging: AuthLoggingEntity[];

  @OneToOne(() => ClientEntity, (client) => client.user)
  client?: ClientEntity;

  @OneToOne(() => WorkerEntity, (worker) => worker.user)
  worker?: WorkerEntity;

  @OneToOne(() => SystemAdminEntity, (admin) => admin.user)
  systemAdmin?: SystemAdminEntity;

  @OneToOne(() => ProviderAdminEntity, (admin) => admin.user)
  providerAdmin?: ProviderAdminEntity;
}
