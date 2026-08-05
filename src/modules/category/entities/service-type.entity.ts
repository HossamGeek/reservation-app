import { AbstractEntityWithDeletedAt } from 'src/libs/entities/abstract.entity';
import { ServiceType } from 'src/libs/enums/service-type.enum';
import { ServiceEntity } from 'src/modules/service/entities/service.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ServiceTypeOptionEntity } from './service-type-option.entity';

@Entity('service_types')
export class ServiceTypeEntity extends AbstractEntityWithDeletedAt {
  @Column({ type: 'varchar', length: 255, unique: true })
  nameEn: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  nameAr: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  supportsOptions: boolean;

  @OneToMany(
    () => ServiceTypeOptionEntity,
    (serviceTypeOption) => serviceTypeOption.serviceType,
  )
  options: ServiceTypeOptionEntity[];

  @OneToMany(() => ServiceEntity, (service) => service.serviceType)
  services: ServiceEntity[];

  @Column({ type: 'enum', enum: ServiceType, nullable: true })
  type: ServiceType;
}
