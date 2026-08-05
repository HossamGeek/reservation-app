import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import * as path from 'path';
import { UPLOAD_BASE_PATH } from 'src/libs/constants/global-constants';
import { DocumentStatusEnum } from 'src/libs/enums/document-status.enum';
import { DocumentEntityTypeEnum } from 'src/libs/enums/document-entity-type.enum';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { DocumentService } from 'src/modules/document/document.service';
import { DocumentEntity } from 'src/modules/document/entities/document.entity';
import { UploadDocumentDto } from 'src/modules/document/dto/request/upload-document.dto';

jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
  };
});

describe('DocumentService - reviewDocument', () => {
  let service: DocumentService;

  const documentRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const i18n = {
    t: jest.fn((key: string) => key),
  };

  const adminUser = {
    id: 'admin-id',
    type: UserTypeEnum.ADMIN,
  } as ILoginUser;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: getRepositoryToken(DocumentEntity),
          useValue: documentRepository,
        },
        {
          provide: I18nService,
          useValue: i18n,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should approve pending provider document', async () => {
    const document = {
      id: 'doc-id',
      entityType: DocumentEntityTypeEnum.Provider,
      status: DocumentStatusEnum.Pending,
      rejectionReason: 'old reason',
      verifiedById: null,
      verifiedAt: null,
    };

    documentRepository.findOne.mockResolvedValue(document);
    documentRepository.save.mockResolvedValue(document);

    await service.reviewDocument(
      'doc-id',
      { status: DocumentStatusEnum.Approved },
      adminUser,
    );

    expect(documentRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'doc-id' },
    });

    expect(documentRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'doc-id',
        status: DocumentStatusEnum.Approved,
        verifiedById: adminUser.id,
        verifiedAt: expect.any(Date),
      }),
    );
  });

  it('should reject pending provider document with rejection reason', async () => {
    const document = {
      id: 'doc-id',
      entityType: DocumentEntityTypeEnum.Provider,
      status: DocumentStatusEnum.Pending,
      rejectionReason: null,
      verifiedById: null,
      verifiedAt: null,
    };

    documentRepository.findOne.mockResolvedValue(document);
    documentRepository.save.mockResolvedValue(document);

    await service.reviewDocument(
      'doc-id',
      {
        status: DocumentStatusEnum.Rejected,
        rejectionReason: 'The uploaded document is expired.',
      },
      adminUser,
    );

    expect(documentRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'doc-id',
        status: DocumentStatusEnum.Rejected,
        rejectionReason: 'The uploaded document is expired.',
        verifiedById: adminUser.id,
        verifiedAt: expect.any(Date),
      }),
    );
  });

  it('should throw NotFoundException when document does not exist', async () => {
    documentRepository.findOne.mockResolvedValue(null);

    await expect(
      service.reviewDocument(
        'doc-id',
        { status: DocumentStatusEnum.Approved },
        adminUser,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(documentRepository.save).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when document is not provider document', async () => {
    documentRepository.findOne.mockResolvedValue({
      id: 'doc-id',
      entityType: '',
      status: DocumentStatusEnum.Pending,
    });

    await expect(
      service.reviewDocument(
        'doc-id',
        { status: DocumentStatusEnum.Approved },
        adminUser,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(documentRepository.save).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when document is not pending', async () => {
    documentRepository.findOne.mockResolvedValue({
      id: 'doc-id',
      entityType: DocumentEntityTypeEnum.Provider,
      status: DocumentStatusEnum.Approved,
    });

    await expect(
      service.reviewDocument(
        'doc-id',
        { status: DocumentStatusEnum.Approved },
        adminUser,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(documentRepository.save).not.toHaveBeenCalled();
  });
});

describe('DocumentService - uploadMultiple', () => {
  let service: DocumentService;

  const documentRepository = {
    create: jest.fn((data) => data),
    save: jest.fn((data) => Promise.resolve(data)),
  };

  const i18n = {
    t: jest.fn((key: string, _options?: Record<string, unknown>) => key),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: getRepositoryToken(DocumentEntity),
          useValue: documentRepository,
        },
        {
          provide: I18nService,
          useValue: i18n,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should throw BadRequestException if files array is empty or undefined', async () => {
    await expect(
      service.uploadMultiple([], {} as UploadDocumentDto),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if files array exceeds MAX_FILE_COUNT', async () => {
    const files = Array(11).fill({
      originalname: 'test.png',
      buffer: Buffer.from('test'),
      size: 100,
    }) as Express.Multer.File[];

    await expect(
      service.uploadMultiple(files, {} as UploadDocumentDto),
    ).rejects.toThrow(BadRequestException);
  });

  it('should upload files successfully when within MAX_FILE_COUNT', async () => {
    const files = [
      {
        originalname: 'test.png',
        buffer: Buffer.from('test'),
        size: 100,
        fieldname: 'file1',
      },
    ] as Express.Multer.File[];

    const result = await service.uploadMultiple(files, { entityType: DocumentEntityTypeEnum.Provider, entityId: 'provider-1' } as UploadDocumentDto);

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('file1');
    expect(documentRepository.save).toHaveBeenCalled();
  });
});

describe('DocumentService - getDownloadFile', () => {
  const documentRepository = {
    findOne: jest.fn(),
  };
  const i18n = {
    t: jest.fn((key: string) => key),
  };
  const adminUser = { id: '1', type: UserTypeEnum.ADMIN } as ILoginUser;

  let service: DocumentService;

  beforeEach(() => {
    jest.clearAllMocks();
    documentRepository.findOne.mockReset();
    service = new DocumentService(
      documentRepository as never,
      i18n as unknown as I18nService,
    );
  });

  afterEach(() => jest.restoreAllMocks());

  it.each([
    ['contract.pdf', 'application/pdf'],
    ['photo.jpg', 'image/jpeg'],
    ['photo.jpeg', 'image/jpeg'],
    ['photo.png', 'image/png'],
    ['photo.webp', 'image/webp'],
  ])('should download %s', async (name, mimeType) => {
    const document = {
      id: '10',
      fileName: `stored-${name}`,
      fileSize: '4',
      fileType: name.split('.').pop()?.toUpperCase(),
      entityType: null,
      entityId: adminUser.id,
    } as DocumentEntity;

    fs.mkdirSync(UPLOAD_BASE_PATH, { recursive: true });
    const storedFilePath = path.join(UPLOAD_BASE_PATH, document.fileName);
    fs.writeFileSync(storedFilePath, 'file');
    documentRepository.findOne.mockResolvedValue(document);

    const result = await service.getDownloadFile('10', adminUser);

    expect(documentRepository.findOne).toHaveBeenCalledWith({
      where: { id: '10' },
    });
    expect(result.stream).toBeDefined();
    result.stream.destroy();
    expect(result.contentType).toBe(mimeType);
    expect(result.originalName).toBe(document.fileName);
    expect(result.size).toBe('4');
  });

  it('should throw NotFoundException when document does not exist', async () => {
    documentRepository.findOne.mockResolvedValue(null);

    await expect(
      service.getDownloadFile('10', adminUser),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should allow provider users assigned to the document provider', async () => {
    const providerUser = {
      id: '20',
      type: UserTypeEnum.PROVIDER,
    } as ILoginUser;

    const document = {
      fileName: 'provider-owned.pdf',
      fileSize: '4',
      fileType: 'PDF',
      entityType: DocumentEntityTypeEnum.Provider,
      entityId: '20',
    };

    fs.mkdirSync(UPLOAD_BASE_PATH, { recursive: true });
    const storedFilePath = path.join(UPLOAD_BASE_PATH, document.fileName);
    fs.writeFileSync(storedFilePath, 'file');
    documentRepository.findOne.mockResolvedValue(document);

    const result = await service.getDownloadFile('10', providerUser);

    expect(result.contentType).toBe('application/pdf');
    result.stream.destroy();
  });

  it('should throw ForbiddenException when authorization fails', async () => {
    const providerUser = {
      id: 'provider-user',
      type: UserTypeEnum.PROVIDER,
    } as ILoginUser;

    documentRepository.findOne.mockResolvedValue({
      fileName: 'forbidden-provider.pdf',
      fileSize: '4',
      fileType: 'PDF',
      entityType: DocumentEntityTypeEnum.Provider,
      entityId: '20',
    });
    fs.mkdirSync(UPLOAD_BASE_PATH, { recursive: true });
    fs.writeFileSync(
      path.join(UPLOAD_BASE_PATH, 'forbidden-provider.pdf'),
      'file',
    );

    await expect(
      service.getDownloadFile('10', providerUser),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should use application/octet-stream for unsupported file types', async () => {
    documentRepository.findOne.mockResolvedValue({
      fileName: 'a.exe',
      fileSize: '4',
      fileType: 'EXE',
      entityId: adminUser.id,
    });
    fs.mkdirSync(UPLOAD_BASE_PATH, { recursive: true });
    fs.writeFileSync(path.join(UPLOAD_BASE_PATH, 'a.exe'), 'file');

    const result = await service.getDownloadFile('10', adminUser);

    expect(result.contentType).toBe('application/octet-stream');
    result.stream.destroy();
  });

  it('should throw NotFoundException when physical file is missing', async () => {
    documentRepository.findOne.mockResolvedValue({
      fileName: 'missing-download-file.pdf',
      fileType: 'PDF',
      entityId: adminUser.id,
    });
    const missingPath = path.join(
      UPLOAD_BASE_PATH,
      'missing-download-file.pdf',
    );
    if (fs.existsSync(missingPath)) {
      fs.unlinkSync(missingPath);
    }

    await expect(
      service.getDownloadFile('10', adminUser),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
