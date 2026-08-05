import { AbstractEntity } from 'src/libs/entities/abstract.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

export enum LoggingType {
  login = 0,
  logoutAll = 1,
  generate_token = 2,
  refresh_token = 3,
  revoke_refresh_token = 4,
}

@Entity('auth_logging')
@Index('IDX_USER_LOGGING_INDEX', ['userId', 'type', 'uuid'])
export class AuthLoggingEntity extends AbstractEntity {
  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'varchar', nullable: true })
  uuid: string;

  @Column({ type: 'smallint' })
  type: LoggingType;

  @Column({ type: 'varchar', nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', nullable: true })
  userAgent: string;

  @ManyToOne(() => UserEntity, (user) => user.authLogging)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
