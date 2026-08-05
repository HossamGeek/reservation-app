import { Column, Entity } from 'typeorm';
import { AbstractEntity } from 'src/libs/entities/abstract.entity';

@Entity({ name: 'nationalities' })
export class NationalityEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  nameEn: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  nameAr: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;
}
