import { Column, Entity } from 'typeorm';
import { AbstractEntity } from 'src/libs/entities/abstract.entity';

@Entity({ name: 'days' })
export class DayEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  nameEn: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  nameAr: string;

  @Column({ type: 'integer' })
  sortOrder: number;
}
