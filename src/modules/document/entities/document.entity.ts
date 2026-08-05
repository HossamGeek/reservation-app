import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from 'src/libs/entities/abstract.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { DocumentTypeEnum } from 'src/libs/enums/document-type.enum';
import { DocumentEntityTypeEnum } from 'src/libs/enums/document-entity-type.enum';
import { DocumentStatusEnum } from 'src/libs/enums/document-status.enum';

@Entity({ name: 'documents' })
@Index(['entityType', 'entityId'])
@Index(['documentType'])
export class DocumentEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 50, nullable: true })
  entityType: DocumentEntityTypeEnum | null;

  @Column({ type: 'bigint', nullable: true })
  entityId: string | null;

  @Column({ type: 'varchar', length: 50 })
  documentType: DocumentTypeEnum;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'bigint' })
  fileSize: string;

  // TODO: Remove nullable from originalFileName later
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  originalFileName: string;

  @Column({ type: 'varchar', length: 10 })
  fileType: string;

  @Column({ type: 'bigint', nullable: true })
  verifiedById: string | null;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'verifiedById' })
  verifiedBy: UserEntity | null;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  @Column({ type: 'varchar', length: 50, default: DocumentStatusEnum.Pending })
  status: DocumentStatusEnum;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ type: 'boolean', default: false })
  isUsed: boolean;

  /**
   * Return full URL for a stored document file.
   */
  fullUrl(): string | null {
    return this.fileName
      ? `${process.env.BASE_URL}/public/${this.fileName}`
      : null;
  }
}
