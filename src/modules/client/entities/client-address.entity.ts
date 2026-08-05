import { AbstractEntity } from 'src/libs/entities/abstract.entity';
import { CityEntity } from 'src/modules/city/entities/city.entity';
import { ClientEntity } from './client.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Index('UQ_client_addresses_one_default_per_client', ['clientId'], {
  unique: true,
  where: '"isDefault" = true',
})
@Entity('client_addresses')
export class ClientAddressEntity extends AbstractEntity {
  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: string;

  @Column({ type: 'text' })
  fullAddress: string;

  @Column({ type: 'bigint', nullable: true })
  cityId?: string | null;

  @ManyToOne(() => CityEntity, (city) => city.clientAddresses, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'cityId' })
  city?: CityEntity | null;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  buildingNumber: string;

  @Column({ type: 'varchar' })
  homeNumber: string;

  @Column({ type: 'varchar' })
  phoneNumber: string;

  @Column({ type: 'boolean' })
  isDefault: boolean;

  @Column({ type: 'bigint' })
  clientId: string;

  @ManyToOne(() => ClientEntity, (client) => client.addresses, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'clientId' })
  client: ClientEntity;
}
