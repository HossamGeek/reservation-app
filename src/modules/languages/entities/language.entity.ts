import { Column, Entity } from 'typeorm';
import { AbstractEntityWithDeletedAt } from 'src/libs/entities/abstract.entity';

@Entity('languages')
export class LanguageEntity extends AbstractEntityWithDeletedAt {
  @Column({ type: 'varchar', length: 255, unique: true })
  nameAr!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  nameEn!: string;

  @Column({ type: 'boolean', default: false })
  isActive!: boolean;
}
