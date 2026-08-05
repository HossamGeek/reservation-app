import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { DocumentEntityTypeEnum } from 'src/libs/enums/document-entity-type.enum';
import { DocumentStatusEnum } from 'src/libs/enums/document-status.enum';
import { ProviderStatusEnum } from 'src/libs/enums/provider-status.enum';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { ProviderTranslationMapper } from 'src/libs/mappers/provider-translation.mapper';
import { getProviderRequestsPaginationConfig } from 'src/libs/pagination/provider-join-requests.pagination';
import { EntityManager, In, Repository } from 'typeorm';
import { BranchService } from '../branch/branch.service';
import { CreateBranchDto } from '../branch/dto/request/create-branch.dto';
import { UpdateBranchDto } from '../branch/dto/request/update-branch.dto';
import { CityService } from '../city/city.service';
import { DocumentService } from '../document/document.service';
import { ProviderAdminEntity } from '../user/entities/provider-admin.entity';
import { UserService } from '../user/user.service';
import {
  CreateProviderDto,
  ProviderDocumentsDto,
} from './dto/request/create-provider.dto';
import { UpdateProviderApplicationStatusDto } from './dto/request/update-provider-application-status.dto';
import { UpdateProviderDto } from './dto/request/update-provider.dto';
import { ProviderPendingRequestDetailsResponseDto } from './dto/response/provider-pending-request-details-response.dto';
import { ProviderResponseDto } from './dto/response/provider-response.dto';
import { ProviderEntity } from './entities/provider.entity';
import {
  PROVIDER_DOCUMENT_FIELDS,
  ProviderDocumentFieldConfig,
  REPLACEABLE_TARGET_DOCUMENT_STATUSES,
} from './provider-documents.constant';

import { DocumentTranslationMapper } from 'src/libs/mappers/document-translation.mapper';
import { DocumentResponseDto } from '../document/dto/response/document-response.dto';
import { ProviderDetailsResponseDto } from './dto/response/provider-details-response.dto';
import { BaseEntityService } from 'src/libs/base-service/base-entity.service';

@Injectable()
export class ProviderService extends BaseEntityService<ProviderEntity> {
  constructor(
    @InjectRepository(ProviderEntity)
    repository: Repository<ProviderEntity>,
    i18n: I18nService,
    private readonly documentService: DocumentService,
    private readonly entityManager: EntityManager,
    private readonly userService: UserService,
    @Inject(forwardRef(() => BranchService))
    private readonly branchService: BranchService,
    private readonly cityService: CityService,
  ) {
    super(repository, i18n);
  }

  async create(
    createProviderDto: CreateProviderDto,
    loggedInUser: ILoginUser,
  ): Promise<void> {
    // If the provider is created by an authenticated admin, ignore the password
    // provided in the request. A random password will be generated and emailed
    // to the owner after the account is created.
    if (loggedInUser) {
      delete createProviderDto.owner.password;
    } else if (!createProviderDto.owner.password) {
      throw new UnprocessableEntityException({
        message: this.i18n.t('providers.errors.passwordRequired'),
      });
    }

    // Check if the name already exist
    const existProvider = await this.findOneBy({
      where: ProviderTranslationMapper.toUniqueWhere(createProviderDto),
    });

    this.validateDuplicates(
      existProvider,
      createProviderDto,
      ProviderTranslationMapper.duplicateFieldsMapping,
      'providers.alreadyExists',
    );

    //Check city
    await this.checkCity(createProviderDto.cityId);

    //Check documents
    const documentIds = await this.checkDocuments(createProviderDto.documents);

    //Prepare Provider
    const newProvider = ProviderTranslationMapper.toEntity(createProviderDto);
    newProvider.status = ProviderStatusEnum.UnderReview;

    await this.entityManager.transaction(async (entityManager) => {
      //Create the provider
      const savedProvider = await entityManager.save(
        ProviderEntity,
        newProvider,
      );

      //Create User
      const user = await this.userService.createProviderOwner(
        createProviderDto.owner,
        entityManager,
      );

      //Create provider admin record
      const providerAdmin = new ProviderAdminEntity();
      providerAdmin.isOwner = true;
      providerAdmin.userId = user.id;
      providerAdmin.providerId = savedProvider.id;
      await entityManager.save(providerAdmin);

      //Create Branch
      const branchDto: CreateBranchDto = {
        name: createProviderDto.name,
        address: createProviderDto.address,
        cityId: createProviderDto.cityId,
        logoId: createProviderDto.documents.logoId,
      };

      await this.branchService.createMainBranch(
        branchDto,
        savedProvider.id,
        entityManager,
      );

      //Mark the docs as used
      await this.documentService.markAsUsed(
        documentIds,
        DocumentEntityTypeEnum.Provider,
        savedProvider.id,
        entityManager,
      );
    });
  }

  private async checkDocuments(
    providerDocumentsDto: ProviderDocumentsDto,
  ): Promise<string[]> {
    const documents = [
      {
        id: providerDocumentsDto.commercialRegistrationDocumentId,
        key: 'providers.errors.documents.notFound.commercialDoc',
      },
      {
        id: providerDocumentsDto.recruitmentLicenseDocumentId,
        key: 'providers.errors.documents.notFound.recruitmentLicenseDoc',
      },
      {
        id: providerDocumentsDto.nationalAddressProofDocumentId,
        key: 'providers.errors.documents.notFound.nationalAddressProofDoc',
      },
      {
        id: providerDocumentsDto.ibanCertificateDocumentId,
        key: 'providers.errors.documents.notFound.ibanCertificateDoc',
      },
      {
        id: providerDocumentsDto.logoId,
        key: 'providers.errors.documents.notFound.logo',
      },
    ];

    if (providerDocumentsDto.vatCertificateDocumentId) {
      documents.push({
        id: providerDocumentsDto.vatCertificateDocumentId,
        key: 'providers.errors.documents.notFound.vatCertificateDoc',
      });
    }

    // Ensure all document ids are unique
    const documentIds = documents.map((document) => document.id);

    if (new Set(documentIds).size !== documentIds.length) {
      throw new UnprocessableEntityException(
        this.i18n.t('providers.errors.documents.mustBeUnique'),
      );
    }

    const existingIds = new Set(
      await this.documentService.findExistingIds(documentIds),
    );

    const missingDocument = documents.find(
      (document) => !existingIds.has(document.id),
    );

    if (missingDocument) {
      throw new NotFoundException(this.i18n.t(missingDocument.key));
    }

    return documentIds;
  }

  private async checkCity(cityId: string): Promise<void> {
    await this.cityService.findOneByOrFail({
      where: { id: cityId },
    });
  }

  async findAll(query: PaginateQuery): Promise<Paginated<ProviderResponseDto>> {
    const statuses = [
      ProviderStatusEnum.Approved,
      ProviderStatusEnum.Suspended,
      ProviderStatusEnum.Draft,
    ];

    const queryBuilder = this.repository
      .createQueryBuilder('provider')
      .leftJoinAndSelect('provider.logo', 'logo')
      .leftJoinAndSelect(
        'provider.branches',
        'branch',
        'branch.isMainBranch = true',
      )
      .leftJoinAndSelect('branch.city', 'city')
      .where('provider.status IN (:...statuses)', {
        statuses,
      });

    const result = await paginate(
      query,
      queryBuilder,
      getProviderRequestsPaginationConfig,
    );

    const mappedData = ProviderTranslationMapper.toResponses(
      result.data,
      'accepted',
    );

    return {
      ...result,
      data: mappedData,
    } as unknown as Paginated<ProviderResponseDto>;
  }

  async findAllJoinRequests(
    query: PaginateQuery,
  ): Promise<Paginated<ProviderResponseDto>> {
    const statuses = [
      ProviderStatusEnum.UnderReview,
      ProviderStatusEnum.Rejected,
    ];

    const queryBuilder = this.repository
      .createQueryBuilder('provider')
      .leftJoinAndSelect('provider.logo', 'logo')
      .leftJoinAndSelect(
        'provider.branches',
        'branch',
        'branch.isMainBranch = true',
      )
      .leftJoinAndSelect('branch.city', 'city')
      .where('provider.status IN (:...statuses)', {
        statuses,
      });

    const result = await paginate(
      query,
      queryBuilder,
      getProviderRequestsPaginationConfig,
    );

    const mappedData = ProviderTranslationMapper.toResponses(result.data);

    return {
      ...result,
      data: mappedData,
    } as unknown as Paginated<ProviderResponseDto>;
  }

  async findProviderDetails(
    id: string,
    user: ILoginUser,
  ): Promise<ProviderDetailsResponseDto> {
    const statuses = [
      ProviderStatusEnum.UnderReview,
      ProviderStatusEnum.Rejected,
    ];
    const provider = await this.findOneByOrFail({
      where: { id },
      relations: {
        admins: {
          user: true,
        },
        branches: {
          city: true,
        },
      },
    });

    const owner = provider.admins[0]?.user;

    if (user.type === UserTypeEnum.PROVIDER && user.id !== owner?.id) {
      throw new NotFoundException(this.i18n.t('auth.errors.notAuthorized'));
    }

    if (statuses.includes(provider.status)) {
      throw new UnprocessableEntityException({
        message: this.i18n.t(`providers.errors.on${provider.status}`),
      });
    }
    return ProviderTranslationMapper.providerDetailsResponse(provider);
  }

  async findPendingProvider(
    id: string,
    user: ILoginUser,
  ): Promise<ProviderPendingRequestDetailsResponseDto> {
    const provider = await this.repository.findOne({
      where: { id },
      relations: {
        admins: {
          user: true,
        },
        branches: {
          city: true,
        },
        logo: true,
        commercialRegistrationDocument: true,
        recruitmentLicenseDocument: true,
        nationalAddressProofDocument: true,
        ibanCertificateDocument: true,
        vatCertificateDocument: true,
      },
    });

    if (!provider) {
      throw new NotFoundException(
        this.i18n.t('providers.get.providerJoinRequestNotFound'),
      );
    }

    const owner = provider.admins[0]?.user;

    if (user.type === UserTypeEnum.PROVIDER && user.id !== owner?.id) {
      throw new NotFoundException(this.i18n.t('auth.errors.notAuthorized'));
    }

    const providerMapper =
      ProviderTranslationMapper.toPendingRequestResponse(provider);

    if (provider.status === ProviderStatusEnum.Approved) {
      providerMapper.whiteLabelUrl = 'https://localhost:3000';
    }

    return providerMapper;
  }

  async updateApplicationStatus(
    id: string,
    updateDto: UpdateProviderApplicationStatusDto,
    user: ILoginUser,
  ): Promise<void> {
    const provider = await this.findOneByOrFail({
      where: { id },
      relations: {
        logo: true,
        commercialRegistrationDocument: true,
        recruitmentLicenseDocument: true,
        nationalAddressProofDocument: true,
        ibanCertificateDocument: true,
        vatCertificateDocument: true,
      },
    });

    if (provider.status === ProviderStatusEnum.Approved) {
      throw new UnprocessableEntityException({
        message: this.i18n.t('providers.errors.status.forbidden'),
      });
    }

    if (updateDto.status === ProviderStatusEnum.Approved) {
      const requiredDocs = [
        provider.logo,
        provider.commercialRegistrationDocument,
        provider.recruitmentLicenseDocument,
        provider.nationalAddressProofDocument,
        provider.ibanCertificateDocument,
      ];

      if (provider.vatCertificateDocument) {
        requiredDocs.push(provider.vatCertificateDocument);
      }

      const hasPendingOrRejected = requiredDocs.some(
        (doc) =>
          !doc ||
          doc.status === DocumentStatusEnum.Pending ||
          doc.status === DocumentStatusEnum.Rejected,
      );

      if (hasPendingOrRejected) {
        throw new UnprocessableEntityException({
          message: this.i18n.t('providers.errors.documents.notApproved'),
        });
      }

      provider.rejectionReason = null;
    } else if (updateDto.status === ProviderStatusEnum.Rejected) {
      provider.rejectionReason = updateDto.rejectionReason;
    }

    provider.status = updateDto.status;
    provider.reviewedById = user.id;
    provider.reviewedAt = new Date();

    await this.repository.save(provider);
  }

  async update(
    updateDto: UpdateProviderDto,
    loggedInUser: ILoginUser,
  ): Promise<ProviderResponseDto> {
    const providerId = loggedInUser.providerAdmin?.providerId;
    if (!providerId) {
      throw new ForbiddenException(this.i18n.t('auth.errors.notAuthorized'));
    }

    const provider = await this.findOneByOrFail({
      where: { id: providerId },
      relations: {
        branches: {
          city: true,
        },
        admins: {
          user: true,
        },
      },
    });

    // Check if the name already exist
    const existProvider = await this.findOneBy({
      where: ProviderTranslationMapper.toUniqueWhere(updateDto, provider.id),
    });

    this.validateDuplicates(
      existProvider,
      updateDto,
      ProviderTranslationMapper.duplicateFieldsMapping,
      'providers.alreadyExists',
    );

    if (updateDto.cityId) {
      await this.checkCity(updateDto.cityId);
    }

    if (updateDto.documents) {
      await this.checkDocumentsForPatch(updateDto.documents, provider);
    }

    let returnedProvider: ProviderEntity = {} as ProviderEntity;

    await this.entityManager.transaction(async (entityManager) => {
      // Update the owner if provided
      if (updateDto.owner) {
        const owner = provider.admins[0]?.user;
        if (owner) {
          await this.userService.updateProviderOwner(owner, updateDto.owner);
        }
      }

      // Update the branch
      if (updateDto.name || updateDto.cityId) {
        const mainBranch = provider.branches.filter(
          (branch) => branch.isMainBranch,
        )[0];
        const updatedMainBranch: UpdateBranchDto = {
          name: updateDto.name,
          address: updateDto.address,
          cityId: updateDto.cityId,
        };
        await this.branchService.updateBranch(
          mainBranch,
          updatedMainBranch,
          entityManager,
        );
      }

      // Mark the docs as used if documents are provided
      if (updateDto.documents) {
        await this.unassignOldDocuments(
          updateDto.documents,
          provider,
          entityManager,
        );
        await this.assignNewDocuments(
          updateDto.documents,
          provider,
          entityManager,
        );
      }

      const updatedProvider = ProviderTranslationMapper.toUpdateEntity(
        provider,
        updateDto,
      );

      // Update the provider
      returnedProvider = await entityManager.save(
        ProviderEntity,
        updatedProvider,
      );
    });

    const mappedResponse =
      ProviderTranslationMapper.toResponse(returnedProvider);
    return mappedResponse;
  }

  private async checkDocumentsForPatch(
    providerDocumentsDto: Partial<ProviderDocumentsDto>,
    provider: ProviderEntity,
  ): Promise<string[]> {
    const requestedDocuments =
      this.resolveRequestedDocumentFields(providerDocumentsDto);

    this.assertUniqueDocumentIds(requestedDocuments);
    await this.validateTargetDocuments(provider, requestedDocuments);
    await this.validateSuppliedDocuments(provider, requestedDocuments);

    return requestedDocuments.map((d) => d.id);
  }

  private resolveRequestedDocumentFields(
    dto: Partial<ProviderDocumentsDto>,
  ): (ProviderDocumentFieldConfig & { id: string })[] {
    return PROVIDER_DOCUMENT_FIELDS.map((field) => ({
      ...field,
      id: dto[field.key] as string | undefined,
    })).filter((field): field is ProviderDocumentFieldConfig & { id: string } =>
      Boolean(field.id),
    );
  }

  private assertUniqueDocumentIds(requestedDocuments: { id: string }[]): void {
    const ids = requestedDocuments.map((d) => d.id);
    if (new Set(ids).size !== ids.length) {
      throw new UnprocessableEntityException(
        this.i18n.t('providers.errors.documents.mustBeUnique'),
      );
    }
  }

  private async validateSuppliedDocuments(
    provider: ProviderEntity,
    requestedDocuments: (ProviderDocumentFieldConfig & { id: string })[],
  ): Promise<void> {
    if (requestedDocuments.length === 0) {
      return;
    }

    const ids = requestedDocuments.map((d) => d.id);

    const documents = await this.documentService.findBy({
      where: {
        id: In(ids),
      },
      select: { id: true, entityId: true, status: true, isUsed: true },
    });

    const documentsById = new Map(documents?.map((doc) => [doc.id, doc]));

    for (const field of requestedDocuments) {
      const doc = documentsById.get(field.id);
      // 1. Ownership — does this document already belong to someone/something else?
      if (doc?.entityId && doc?.entityId !== provider.id) {
        throw new UnprocessableEntityException(
          this.i18n.t(field.alreadyAssignedKey),
        );
      }

      // 2. In-use — is it actively consumed, regardless of by whom
      if (doc?.isUsed) {
        throw new UnprocessableEntityException(
          this.i18n.t(field.alreadyUsedKey),
        );
      }

      // 3. Review status — is it actually in a state where it's ready to be assigned?
      if (doc?.status !== DocumentStatusEnum.Pending) {
        throw new UnprocessableEntityException(
          this.i18n.t(field.notPendingKey),
        );
      }
    }
  }

  private async validateTargetDocuments(
    provider: ProviderEntity,
    requestedDocuments: (ProviderDocumentFieldConfig & { id: string })[],
  ): Promise<void> {
    // Look at ALL document slots on the provider (not just requested ones),
    // To detect if any rejected documents are not being left out without replacement.
    const providerFieldsWithOldId = PROVIDER_DOCUMENT_FIELDS.map((field) => ({
      ...field,
      oldId: provider[field.key] as string | undefined,
    })).filter((field): field is typeof field & { oldId: string } =>
      Boolean(field.oldId),
    );

    const oldIds = providerFieldsWithOldId.map((field) => field.oldId);

    const existingDocuments = await this.documentService.findBy({
      where: { id: In(oldIds) },
      select: { id: true, status: true },
    });

    const existingDocumentsById = new Map(
      existingDocuments?.map((doc) => [doc.id, doc]),
    );

    const isReplaceable = (oldId: string): boolean => {
      const oldDocument = existingDocumentsById.get(oldId);
      return (
        !!oldDocument &&
        REPLACEABLE_TARGET_DOCUMENT_STATUSES.includes(oldDocument.status)
      );
    };

    const requestedKeys = new Set(requestedDocuments.map((field) => field.key));

    // 1. Validate the old documents actually targeted for replacement in this request.
    const requestedFieldsWithOldId = providerFieldsWithOldId.filter((field) =>
      requestedKeys.has(field.key),
    );

    for (const field of requestedFieldsWithOldId) {
      if (!isReplaceable(field.oldId)) {
        throw new UnprocessableEntityException(
          this.i18n.t(field.notReplaceableKey),
        );
      }
    }

    // 2. Every provider slot currently rejected must be replaced together —
    // no leaving a rejected document out of this request.
    const rejectedFieldsNotBeingReplaced = providerFieldsWithOldId.filter(
      (field) => isReplaceable(field.oldId) && !requestedKeys.has(field.key),
    );

    if (rejectedFieldsNotBeingReplaced.length > 0) {
      throw new UnprocessableEntityException(
        this.i18n.t('providers.errors.documents.replaceAllRejected'),
      );
    }
  }

  private async unassignOldDocuments(
    providerDocumentsDto: Partial<ProviderDocumentsDto>,
    provider: ProviderEntity,
    entityManager: EntityManager,
  ): Promise<void> {
    const requestedDocuments =
      this.resolveRequestedDocumentFields(providerDocumentsDto);
    if (requestedDocuments.length === 0) {
      return;
    }

    const oldDocumentIds = requestedDocuments
      .map((field) => provider[field.key as keyof ProviderEntity] as string)
      .filter(Boolean);

    if (oldDocumentIds.length === 0) {
      return;
    }

    await this.documentService.unassignDocuments(oldDocumentIds, entityManager);
  }

  private async assignNewDocuments(
    providerDocumentsDto: Partial<ProviderDocumentsDto>,
    provider: ProviderEntity,
    entityManager: EntityManager,
  ): Promise<void> {
    const requestedDocuments =
      this.resolveRequestedDocumentFields(providerDocumentsDto);
    const targetIds = requestedDocuments.map((d) => d.id);

    await this.documentService.markAsUsed(
      targetIds,
      DocumentEntityTypeEnum.Provider,
      provider.id,
      entityManager,
    );
  }

  async findProviderDocuments(
    id: string,
    user: ILoginUser,
  ): Promise<DocumentResponseDto[]> {
    if (
      user.type === UserTypeEnum.PROVIDER &&
      user.providerAdmin?.providerId !== id
    ) {
      throw new NotFoundException(this.i18n.t('auth.errors.notAuthorized'));
    }

    const provider = await this.findOneByOrFail({
      where: { id },
      relations: {
        admins: {
          user: true,
        },
        logo: {
          verifiedBy: true,
        },
        commercialRegistrationDocument: {
          verifiedBy: true,
        },
        recruitmentLicenseDocument: {
          verifiedBy: true,
        },
        nationalAddressProofDocument: {
          verifiedBy: true,
        },
        ibanCertificateDocument: {
          verifiedBy: true,
        },
        vatCertificateDocument: {
          verifiedBy: true,
        },
      },
    });

    return DocumentTranslationMapper.toResponses([
      provider.logo,
      provider.commercialRegistrationDocument,
      provider.recruitmentLicenseDocument,
      provider.nationalAddressProofDocument,
      provider.ibanCertificateDocument,
      provider.vatCertificateDocument,
    ]);
  }
  protected getNotFoundMessage(): string {
    return this.i18n.t('providers.notFound');
  }
}
