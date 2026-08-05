import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import { AbstractEntity } from 'src/libs/entities/abstract.entity';
import { CountryEntity } from 'src/modules/country/entities/country.entity';
import { BranchEntity } from 'src/modules/branch/entities/branch.entity';
import { ClientAddressEntity } from 'src/modules/client/entities/client-address.entity';

@Unique(['countryId', 'nameAr'])
@Unique(['countryId', 'nameEn'])
@Entity({ name: 'cities' })
export class CityEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 255 })
  nameEn: string;

  @Column({ type: 'varchar', length: 255 })
  nameAr: string;

  @Column({ type: 'bigint' })
  countryId: string;

  @ManyToOne(() => CountryEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'countryId' })
  country: CountryEntity;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  /*Relations */
  //Branches
  @OneToMany(() => BranchEntity, (branch) => branch.city)
  branches: BranchEntity[];

  //Client Addresses
  @OneToMany(() => ClientAddressEntity, (clientAddress) => clientAddress.city)
  clientAddresses: ClientAddressEntity[];
}
