import { AbstractEntityWithDeletedAt } from 'src/libs/entities/abstract.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { ServiceEntity } from 'src/modules/service/entities/service.entity';
import { DocumentEntity } from 'src/modules/document/entities/document.entity';

@Entity({ name: 'categories' })
export class CategoryEntity extends AbstractEntityWithDeletedAt {
  @Column({ type: 'varchar', length: 255, unique: true })
  nameEn: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  nameAr: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @OneToMany(() => ServiceEntity, (service) => service.category)
  services: ServiceEntity[];

  @OneToOne(() => DocumentEntity, { nullable: true })
  @JoinColumn({ name: 'logoId' })
  logo: DocumentEntity | null;

  @Column({ type: 'bigint', nullable: true, name: 'logoId' })
  logoId: string | null;

  // TODO: Remove nullable from description fields later
  @Column({ type: 'varchar', length: 255, nullable: true })
  descriptionAr: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descriptionEn: string;
}
