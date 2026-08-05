import { AbstractEntityWithDeletedAt } from 'src/libs/entities/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { DocumentEntity } from 'src/modules/document/entities/document.entity';
import { Exclude } from 'class-transformer';
import { CategoryEntity } from 'src/modules/category/entities/category.entity';
import { ServiceTypeEntity } from 'src/modules/category/entities/service-type.entity';

@Entity({ name: 'services' })
export class ServiceEntity extends AbstractEntityWithDeletedAt {
  @Column({ type: 'bigint', nullable: true })
  categoryId: string;

  @ManyToOne(() => CategoryEntity, (category) => category.services, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  category: CategoryEntity;

  @Column({ type: 'bigint', nullable: true })
  serviceTypeId: string;

  @ManyToOne(() => ServiceTypeEntity, (serviceType) => serviceType.services, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'serviceTypeId' })
  serviceType: ServiceTypeEntity;

  @Column({ type: 'varchar', length: 255, unique: true })
  nameAr: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  nameEn: string;

  @Column({ type: 'varchar', length: 255 })
  descriptionAr: string;

  @Column({ type: 'varchar', length: 255 })
  descriptionEn: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Exclude()
  @Column({ type: 'bigint', nullable: true })
  logoId: string | null;

  @OneToOne(() => DocumentEntity, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'logoId' })
  logo: DocumentEntity | null;
}
