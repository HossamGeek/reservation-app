import { Column, Entity } from 'typeorm';
import { AbstractEntityWithDeletedAt } from 'src/libs/entities/abstract.entity';

@Entity({ name: 'experiences' })
export class ExperienceEntity extends AbstractEntityWithDeletedAt {
  @Column({ type: 'smallint' })
  minYears: number;

  @Column({ type: 'smallint', nullable: true })
  maxYears: number | null;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;
}
