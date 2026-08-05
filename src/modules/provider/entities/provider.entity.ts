import { Exclude } from 'class-transformer';
import { AbstractEntityWithDeletedAt } from 'src/libs/entities/abstract.entity';
import { ProviderStatusEnum } from 'src/libs/enums/provider-status.enum';
import { BranchEntity } from 'src/modules/branch/entities/branch.entity';
import { DocumentEntity } from 'src/modules/document/entities/document.entity';
import { ShiftEntity } from 'src/modules/shifts/entities/shift.entity';
import { ProviderAdminEntity } from 'src/modules/user/entities/provider-admin.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity('providers')
export class ProviderEntity extends AbstractEntityWithDeletedAt {
  @Column({ type: 'varchar', length: 255 })
  nameAr: string;

  @Column({ type: 'varchar', length: 255 })
  nameEn: string;

  @Column({ type: 'varchar', length: 100 })
  commercialRegistrationNumber: string;

  @Column({ type: 'varchar', length: 100 })
  recruitmentLicenseNumber: string;

  @Column({ type: 'varchar', length: 50 })
  status: ProviderStatusEnum;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ type: 'bigint', nullable: true })
  reviewedById: string | null;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'reviewedById' })
  reviewedBy: UserEntity | null;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'bigint', nullable: true })
  createdById: string | null;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'createdById' })
  createdBy: UserEntity | null;

  // Admins
  @OneToMany(
    () => ProviderAdminEntity,
    (providerAdmin) => providerAdmin.provider,
  )
  admins: ProviderAdminEntity[];

  //Branches
  @OneToMany(() => BranchEntity, (branch) => branch.provider)
  branches: BranchEntity[];

  // Shifts
  @OneToMany(() => ShiftEntity, (shift) => shift.provider)
  shifts: ShiftEntity[];

  //Documents
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

  @Exclude()
  @Column({ type: 'bigint' })
  commercialRegistrationDocumentId: string;

  @OneToOne(() => DocumentEntity)
  @JoinColumn({ name: 'commercialRegistrationDocumentId' })
  commercialRegistrationDocument: DocumentEntity;

  @Exclude()
  @Column({ type: 'bigint' })
  recruitmentLicenseDocumentId: string;

  @OneToOne(() => DocumentEntity)
  @JoinColumn({ name: 'recruitmentLicenseDocumentId' })
  recruitmentLicenseDocument: DocumentEntity;

  @Exclude()
  @Column({ type: 'bigint' })
  nationalAddressProofDocumentId: string;

  @OneToOne(() => DocumentEntity)
  @JoinColumn({ name: 'nationalAddressProofDocumentId' })
  nationalAddressProofDocument: DocumentEntity;

  @Exclude()
  @Column({ type: 'bigint' })
  ibanCertificateDocumentId: string;

  @OneToOne(() => DocumentEntity)
  @JoinColumn({ name: 'ibanCertificateDocumentId' })
  ibanCertificateDocument: DocumentEntity;

  @Exclude()
  @Column({ type: 'bigint', nullable: true })
  vatCertificateDocumentId: string;

  @OneToOne(() => DocumentEntity, { nullable: true })
  @JoinColumn({ name: 'vatCertificateDocumentId' })
  vatCertificateDocument?: DocumentEntity;
}
