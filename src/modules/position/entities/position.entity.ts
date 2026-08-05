import { Column, Entity } from 'typeorm';
import { AbstractEntityWithDeletedAt } from 'src/libs/entities/abstract.entity';

@Entity({ name: 'positions' })
export class PositionEntity extends AbstractEntityWithDeletedAt {
  @Column({ type: 'varchar', length: 255, unique: true })
  nameEn: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  nameAr: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;
}
