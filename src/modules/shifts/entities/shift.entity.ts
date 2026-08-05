import { AbstractEntity } from 'src/libs/entities/abstract.entity';
import { ProviderEntity } from 'src/modules/provider/entities/provider.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('shifts')
export class ShiftEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'int', nullable: false })
  fromHour: number;

  @Column({ type: 'int', nullable: false })
  toHour: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => ProviderEntity, (provider) => provider.shifts, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'providerId' })
  provider: ProviderEntity;

  @Column({ type: 'bigint', nullable: false })
  providerId: string;
}
