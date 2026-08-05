import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { I18nService } from 'nestjs-i18n';
import * as path from 'path';
import { BaseEntityFinderService } from 'src/libs/base-service/base-entity-finder.service';
import configs from 'src/libs/configs/configs';
import {
  MAX_FILE_COUNT,
  UPLOAD_BASE_PATH,
} from 'src/libs/constants/global-constants';
import { DocumentEntityTypeEnum } from 'src/libs/enums/document-entity-type.enum';
import { DocumentStatusEnum } from 'src/libs/enums/document-status.enum';
import { DocumentTypeEnum } from 'src/libs/enums/document-type.enum';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { IFindBy } from 'src/libs/interfaces/entity-reader.interface';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { EntityManager, FindManyOptions, In, Repository } from 'typeorm';
import { AllowedExtensions } from '../../libs/enums/allowed-extensions.enum';
import { DocumentDownloadResult } from './dto/document-download-result.interface';
import { ReviewDocumentDto } from './dto/request/review-document.dto';
import { UploadDocumentDto } from './dto/request/upload-document.dto';
import { DocumentEntity } from './entities/document.entity';

@Injectable()
export class DocumentService
  extends BaseEntityFinderService<DocumentEntity>
  implements IFindBy<DocumentEntity>
{
  constructor(
    @InjectRepository(DocumentEntity)
    repository: Repository<DocumentEntity>,
    i18n: I18nService,
  ) {
    super(repository, i18n);
  }

  async uploadMultiple(
    files: Array<Express.Multer.File>,
    dto: UploadDocumentDto,
  ): Promise<Array<{ key: string; document: DocumentEntity }>> {
    if (!files || files.length === 0) {
      throw new BadRequestException(this.i18n.t('documents.errors.noFile'));
    }

    if (files.length > MAX_FILE_COUNT) {
      throw new BadRequestException(
        this.i18n.t('documents.errors.tooManyFiles', {
          args: { maxCount: MAX_FILE_COUNT },
        }),
      );
    }

    // Map each file to a promise that uploads the file and returns { key, document }
    return Promise.all(
      files.map(async (file) => {
        const document = await this.upload(file, dto);

        return {
          key: file.fieldname, // The key sent by the frontend (e.g., 'passport')
          document, // The saved document entity metadata
        };
      }),
    );
  }

  async upload(
    file: Express.Multer.File,
    dto: UploadDocumentDto,
  ): Promise<DocumentEntity> {
    if (!file) {
      throw new BadRequestException(this.i18n.t('documents.errors.noFile'));
    }

    // 1. File Format Validation
    const ext = path.extname(file.originalname).toLowerCase();
    if (!Object.values(AllowedExtensions).includes(ext as AllowedExtensions)) {
      throw new BadRequestException({
        contentType: this.i18n.t('documents.errors.unsupportedType', {
          args: {
            ext,
            supportedTypes: Object.values(AllowedExtensions).join(', '),
          },
        }),
      });
    }

    // 2. File Size Validation
    const maxSize = configs.MAX_FILE_SIZE;
    if (file.size > maxSize) {
      throw new BadRequestException(
        this.i18n.t('documents.errors.fileTooLarge', {
          args: { maxSize: (maxSize / (1024 * 1024)).toString() },
        }),
      );
    }

    // 3. Rename File with a Random UUID
    const timestamp = Date.now();
    const randomName = crypto.randomUUID();
    const fileName = `${randomName}_${timestamp}${ext}`;

    // Determine document type based on extension (.pdf is document, others are picture)
    const documentType =
      ext === '.pdf' ? DocumentTypeEnum.DOCUMENT : DocumentTypeEnum.PICTURE;

    // 4. Save file on Disk
    const uploadBasePath = UPLOAD_BASE_PATH;
    const targetDir = path.resolve(uploadBasePath);

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, fileName), file.buffer);

    // 5. Save to database
    const document = this.repository.create({
      entityType: dto.entityType || null,
      entityId: dto.entityId || null,
      originalFileName: file.originalname,
      documentType,
      fileName,
      fileSize: file.size.toString(),
      fileType: ext.slice(1).toUpperCase(),
    });

    return this.repository.save(document);
  }

  async findOne(id: string): Promise<DocumentEntity> {
    return await this.findOneByOrFail({
      where: { id },
    });
  }

  async findExistingIds(ids: string[]): Promise<string[]> {
    const documents = await this.repository.find({
      select: {
        id: true,
      },
      where: {
        id: In(ids),
        isUsed: false,
      },
    });

    return documents.map((document) => document.id);
  }

  async markAsUsed(
    documentIds: string[],
    entityType: DocumentEntityTypeEnum,
    entityId: string,
    entityManager?: EntityManager,
    status?: DocumentStatusEnum,
  ): Promise<void> {
    if (entityManager) {
      await entityManager.update(
        DocumentEntity,
        {
          id: In(documentIds),
        },
        {
          isUsed: true,
          entityType,
          entityId,
          status,
        },
      );
      return;
    }

    await this.repository.update(
      {
        id: In(documentIds),
      },
      {
        isUsed: true,
        entityType,
        entityId,
        status,
      },
    );
  }

  // TODO: Unassignment should mark documents as deleted so they are never reused again
  async unassignDocuments(
    documentIds: string[],
    entityManager?: EntityManager,
  ): Promise<void> {
    if (entityManager) {
      await entityManager.update(
        DocumentEntity,
        {
          id: In(documentIds),
        },
        {
          isUsed: false,
          entityType: null,
          entityId: null,
        },
      );
      return;
    }

    await this.repository.update(
      {
        id: In(documentIds),
      },
      {
        isUsed: false,
        entityType: null,
        entityId: null,
        status: DocumentStatusEnum.Pending,
      },
    );
  }

  async getFile(id: string): Promise<{
    filePath: string;
    contentType: string;
    document: DocumentEntity;
  }> {
    const doc = await this.findOne(id);
    if (!doc) {
      throw new NotFoundException(this.i18n.t('documents.errors.notFound'));
    }

    const filePath = path.resolve(UPLOAD_BASE_PATH, doc.fileName);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(
        this.i18n.t('documents.errors.physicalFileNotFound'),
      );
    }

    let contentType = 'application/octet-stream';
    if (doc.fileType === 'PDF') {
      contentType = 'application/pdf';
    } else if (['JPG', 'JPEG'].includes(doc.fileType)) {
      contentType = 'image/jpeg';
    } else if (doc.fileType === 'PNG') {
      contentType = 'image/png';
    } else if (doc.fileType === 'WEBP') {
      contentType = 'image/webp';
    }

    return { filePath, contentType, document: doc };
  }

  async getDownloadFile(
    id: string,
    user: ILoginUser,
  ): Promise<DocumentDownloadResult> {
    const { document, filePath, contentType } = await this.getFile(id);

    if (
      (user.type === UserTypeEnum.WORKER ||
        user.type === UserTypeEnum.CLIENT) &&
      document.entityId != user.id
    ) {
      throw new ForbiddenException(this.i18n.t('auth.errors.notAuthorized'));
    }

    return {
      stream: fs.createReadStream(filePath),
      size: document.fileSize,
      contentType,
      originalName: document.fileName,
    };
  }

  async reviewDocument(id: string, dto: ReviewDocumentDto, user: ILoginUser) {
    const document = await this.findOne(id);

    if (!document) {
      throw new NotFoundException(this.i18n.t('documents.errors.notFound'));
    }

    if (document.entityType !== DocumentEntityTypeEnum.Provider) {
      throw new BadRequestException(
        this.i18n.t('documents.errors.onlyProviderDocumentsCanBeReviewed'),
      );
    }

    if (document.status !== DocumentStatusEnum.Pending) {
      throw new BadRequestException(
        this.i18n.t('documents.errors.alreadyReviewed'),
      );
    }
    document.status = dto.status;
    document.verifiedById = user.id;
    document.verifiedAt = new Date();

    if (dto.status === DocumentStatusEnum.Rejected) {
      document.rejectionReason = dto.rejectionReason!;
    }

    await this.repository.save(document);
  }

  async findBy(
    options: FindManyOptions<DocumentEntity>,
  ): Promise<DocumentEntity[] | null> {
    return await this.repository.find(options);
  }
  protected getNotFoundMessage(): string {
    return this.i18n.t('documents.errors.notFound');
  }
}
