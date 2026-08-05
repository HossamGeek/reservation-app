import { AbstractEntityWithDeletedAt } from 'src/libs/entities/abstract.entity';
import { BranchStatusEnum } from 'src/libs/enums/branch-status.enum';
import { CityEntity } from 'src/modules/city/entities/city.entity';
import { DocumentEntity } from 'src/modules/document/entities/document.entity';
import { ProviderEntity } from 'src/modules/provider/entities/provider.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

@Index('IDX_BRANCH_PROVIDER', ['providerId'])
@Entity('branches')
export class BranchEntity extends AbstractEntityWithDeletedAt {
  @Column({ type: 'varchar', length: 255 })
  nameAr: string;

  @Column({ type: 'varchar', length: 255 })
  nameEn: string;

  @Column({ type: 'varchar', length: 255 })
  addressAr: string;

  @Column({ type: 'varchar', length: 255 })
  addressEn: string;

  @Column({ type: 'varchar', length: 50, default: BranchStatusEnum.Inactive})
  status: BranchStatusEnum;

  @Column({ type: 'boolean', default: false })
  isMainBranch: boolean;

  /* Relations*/
  //Provider
  @Column({ type: 'bigint' })
  providerId: string;

  @ManyToOne(() => ProviderEntity, (provider) => provider.branches, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'providerId' })
  provider: ProviderEntity;

  //City
  @Column({ type: 'bigint', nullable: true })
  cityId: string;

  @ManyToOne(() => CityEntity, (city) => city.branches, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'cityId' })
  city: CityEntity;

  // logo
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
