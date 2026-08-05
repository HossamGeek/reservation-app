import { AbstractEntity } from 'src/libs/entities/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { Exclude } from 'class-transformer';
import { ProviderEntity } from 'src/modules/provider/entities/provider.entity';

@Entity('provider-admins')
export class ProviderAdminEntity extends AbstractEntity {
  @Column({ type: 'boolean', default: false })
  isOwner: boolean;

  /*Relationships*/
  //User
  @Exclude()
  @Column({ type: 'bigint' })
  userId: string;

  @OneToOne(() => UserEntity, (user) => user.providerAdmin)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  //Provider
  @Column({ type: 'bigint' })
  providerId: string;

  @ManyToOne(() => ProviderEntity, (provider) => provider.admins, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'providerId' })
  provider?: ProviderEntity;
}
