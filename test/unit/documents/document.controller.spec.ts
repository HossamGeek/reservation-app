import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Readable } from 'stream';
import { DocumentStatusEnum } from 'src/libs/enums/document-status.enum';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { DocumentController } from 'src/modules/document/document.controller';
import { DocumentService } from 'src/modules/document/document.service';

describe('DocumentController', () => {
  let controller: DocumentController;

  const documentService = {
    reviewDocument: jest.fn(),
    getDownloadFile: jest.fn(),
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
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: documentService,
        },
        {
          provide: I18nService,
          useValue: i18n,
        },
      ],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
  });

  it('should call service and return approved message', async () => {
    documentService.reviewDocument.mockResolvedValue(undefined);

    const result = await controller.reviewDocument(
      { id: 'doc-id' },
      { status: DocumentStatusEnum.Approved },
      adminUser,
    );

    expect(documentService.reviewDocument).toHaveBeenCalledWith(
      'doc-id',
      { status: DocumentStatusEnum.Approved },
      adminUser,
    );

    expect(i18n.t).toHaveBeenCalledWith('documents.update.approved');
    expect(result.message).toBe('documents.update.approved');
  });

  it('should call service and return rejected message', async () => {
    documentService.reviewDocument.mockResolvedValue(undefined);

    const dto = {
      status: DocumentStatusEnum.Rejected,
      rejectionReason: 'The uploaded document is expired.',
    };

    const result = await controller.reviewDocument(
      { id: 'doc-id' },
      dto,
      adminUser,
    );

    expect(documentService.reviewDocument).toHaveBeenCalledWith(
      'doc-id',
      dto,
      adminUser,
    );

    expect(i18n.t).toHaveBeenCalledWith('documents.update.rejected');
    expect(result.message).toBe('documents.update.rejected');
  });

  it('should throw error if service throws error', async () => {
    documentService.reviewDocument.mockRejectedValue(
      new Error('service error'),
    );

    await expect(
      controller.reviewDocument(
        { id: 'doc-id' },
        { status: DocumentStatusEnum.Approved },
        adminUser,
      ),
    ).rejects.toThrow('service error');
  });

  describe('download', () => {
    const createResponse = (): Response & {
      status: jest.Mock;
      setHeader: jest.Mock;
      set: jest.Mock;
      destroy: jest.Mock;
      once: jest.Mock;
    } =>
      ({
        status: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
        set: jest.fn(),
        destroy: jest.fn(),
        once: jest.fn(),
        on: jest.fn(),
        emit: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      }) as unknown as Response & {
        status: jest.Mock;
        setHeader: jest.Mock;
        set: jest.Mock;
        destroy: jest.Mock;
        once: jest.Mock;
      };

    it('should set secure headers and return streamable file', async () => {
      const stream = new Readable({ read() {} });
      documentService.getDownloadFile.mockResolvedValue({
        stream,
        originalName: 'عقد.pdf',
        contentDisposition: 'attachment',
        contentType: 'application/pdf',
        size: 123,
      });
      const response = createResponse();

      const result = await controller.download(
        { id: '10' },
        adminUser,
        response,
      );

      expect(documentService.getDownloadFile).toHaveBeenCalledWith(
        '10',
        adminUser,
      );
      expect(response.set).toHaveBeenCalledWith({
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store',
        'Content-Disposition':
          'attachment; filename="عقد.pdf;filename*=UTF-8\'\'%D8%B9%D9%82%D8%AF.pdf"',
        Pragma: 'no-cache',
      });
      expect(response.setHeader).toHaveBeenCalledWith('Content-Length', 123);
      expect(result).toBeDefined();
    });

    it('should not set headers when service fails', async () => {
      documentService.getDownloadFile.mockRejectedValue(
        new NotFoundException(),
      );
      const response = createResponse();

      await expect(
        controller.download({ id: '10' }, adminUser, response),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(response.setHeader).not.toHaveBeenCalled();
    });
  });
});
