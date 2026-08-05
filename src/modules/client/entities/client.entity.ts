import { Exclude } from 'class-transformer';
import { AbstractEntity } from 'src/libs/entities/abstract.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { ClientAddressEntity } from './client-address.entity';

@Entity('clients')
export class ClientEntity extends AbstractEntity {
  @Exclude()
  @Column({ type: 'bigint' })
  userId: string;

  @OneToOne(() => UserEntity, (user) => user.client)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'varchar', nullable: true, unique: true })
  nationalId?: string;

  @OneToMany(() => ClientAddressEntity, (clientAddress) => clientAddress.client)
  addresses: ClientAddressEntity[];
}
