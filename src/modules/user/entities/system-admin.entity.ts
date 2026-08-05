import { AbstractEntity } from 'src/libs/entities/abstract.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { Exclude } from 'class-transformer';

@Entity('system-admins')
export class SystemAdminEntity extends AbstractEntity {
  @Exclude()
  @Column({ type: 'bigint' })
  userId: string;

  @OneToOne(() => UserEntity, (user) => user.systemAdmin)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
