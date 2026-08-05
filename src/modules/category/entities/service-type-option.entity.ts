import { AbstractEntityWithDeletedAt } from 'src/libs/entities/abstract.entity';
import { ServiceTypeOption } from 'src/libs/enums/service-type-option.enum';
import { DocumentEntity } from 'src/modules/document/entities/document.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ServiceTypeEntity } from './service-type.entity';

@Entity('service_type_options')
export class ServiceTypeOptionEntity extends AbstractEntityWithDeletedAt {
  @Column({ type: 'varchar', length: 255, unique: true })
  nameEn: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  nameAr: string;

  @Column({ type: 'varchar', length: 255 })
  descriptionEn: string;

  @Column({ type: 'varchar', length: 255 })
  descriptionAr: string;

  @Column({ type: 'bigint', nullable: true })
  logoId: string | null;

  @ManyToOne(() => DocumentEntity, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'logoId' })
  logo?: DocumentEntity | null;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'bigint' })
  serviceTypeId: string;

  @ManyToOne(() => ServiceTypeEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'serviceTypeId' })
  serviceType: ServiceTypeEntity;

  @Column({ type: 'enum', enum: ServiceTypeOption, nullable: true })
  type: ServiceTypeOption;
}
