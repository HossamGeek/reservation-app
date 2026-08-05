import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from 'src/libs/entities/abstract.entity';
import { CityEntity } from 'src/modules/city/entities/city.entity';

@Entity({ name: 'countries' })
export class CountryEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  nameEn: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  nameAr: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  code: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @OneToMany(() => CityEntity, (city) => city.country)
  cities: CityEntity[];
}
