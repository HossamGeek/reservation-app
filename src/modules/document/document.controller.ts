import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseInterceptors,
  Res,
  UploadedFiles,
  Patch,
  Logger,
  StreamableFile,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { UploadDocumentDto } from './dto/request/upload-document.dto';
import { ApiResponse } from 'src/libs/errors/api-response';
import { Public } from 'src/libs/decorators/public.decorator';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import { Can } from 'src/libs/decorators/entity-action.decorator';
import { ReviewDocumentDto } from './dto/request/review-document.dto';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { CurrentUser } from 'src/libs/decorators/current-user.decorator';
import { DocumentStatusEnum } from 'src/libs/enums/document-status.enum';
import { MAX_FILE_COUNT } from 'src/libs/constants/global-constants';
import { BigIntIdParamDto } from 'src/libs/dto/bigint-id-param.dto';

@ApiTags('Documents')
@ApiBearerAuth('JWT')
@Controller('documents')
export class DocumentController {
  private readonly logger = new Logger(DocumentController.name);
  constructor(
    private readonly documentService: DocumentService,
    private readonly i18n: I18nService,
  ) {}

  @Public()
  @Post('upload-multiple')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload multiple documents' })
  @UseInterceptors(AnyFilesInterceptor({ limits: { files: MAX_FILE_COUNT } }))
  async uploadMultiple(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() dto: UploadDocumentDto,
  ): Promise<ApiResponse> {
    const documents = await this.documentService.uploadMultiple(files, dto);
    return ApiResponse.successResponse(
      this.i18n.t('documents.upload.success'),
      { documents },
    );
  }

  @Can(CategoriesEnum.documents, ActionsEnum.detailedView)
  @Get(':id/file')
  @ApiOperation({ summary: 'Retrieve physical document file' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  async getFile(@Param() params: BigIntIdParamDto, @Res() res: Response) {
    const { filePath, contentType, document } =
      await this.documentService.getFile(params.id);

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${document.originalFileName};filename*=UTF-8''${encodeURIComponent(document.originalFileName)}"`,
    );
    res.sendFile(filePath);
  }

  @Get(':id/download')
  @Can(CategoriesEnum.documents, ActionsEnum.detailedView)
  @ApiOperation({ summary: 'Download an uploaded document file' })
  @ApiProduces('application/pdf', 'image/jpeg', 'image/png', 'image/webp')
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiNotFoundResponse({ description: 'Document file not found' })
  async download(
    @Param() params: BigIntIdParamDto,
    @CurrentUser() user: ILoginUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const file = await this.documentService.getDownloadFile(params.id, user);

    file.stream.once('error', (error: Error) => {
      this.logger.error(
        `Failed to stream document with ID ${params.id}: ${error.message}`,
        error.stack,
      );

      if (!response.destroyed) {
        response.destroy(error);
      }
    });

    response.once('close', () => {
      const clientDisconnectedBeforeCompletion = !response.writableEnded;

      if (clientDisconnectedBeforeCompletion && !file.stream.destroyed) {
        file.stream.destroy();
      }
    });

    response.set({
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
      'Content-Disposition': `attachment; filename="${file.originalName};filename*=UTF-8''${encodeURIComponent(file.originalName)}"`,
      Pragma: 'no-cache',
    });

    if (file.size !== undefined) {
      response.setHeader('Content-Length', file.size);
    }

    return new StreamableFile(file.stream, {
      type: file.contentType,
      disposition: `attachment; filename="${file.originalName}"`,
      length: +file.size,
    });
  }

  @Patch(':id/review')
  @Can(CategoriesEnum.documents, ActionsEnum.update)
  @ApiOperation({ summary: 'Review provider document' })
  @ApiParam({ name: 'id', type: String, example: '1' })
  async reviewDocument(
    @Param() params: BigIntIdParamDto,
    @Body() dto: ReviewDocumentDto,
    @CurrentUser() user: ILoginUser,
  ) {
    await this.documentService.reviewDocument(params.id, dto, user);

    const message =
      dto.status === DocumentStatusEnum.Rejected
        ? this.i18n.t('documents.update.rejected')
        : this.i18n.t('documents.update.approved');

    return ApiResponse.successResponse(message);
  }
}
