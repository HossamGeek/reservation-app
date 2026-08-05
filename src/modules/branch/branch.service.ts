import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { BaseEntityService } from 'src/libs/base-service/base-entity.service';
import { DocumentEntityTypeEnum } from 'src/libs/enums/document-entity-type.enum';
import { DocumentStatusEnum } from 'src/libs/enums/document-status.enum';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { BranchTranslationMapper } from 'src/libs/mappers/branch-translation.mapper';
import { getBranchesPaginationConfig } from 'src/libs/pagination/branches.pagination';
import { EntityManager, Repository } from 'typeorm';
import { CityService } from '../city/city.service';
import { DocumentService } from '../document/document.service';
import { ProviderService } from '../provider/provider.service';
import { CreateBranchDto } from './dto/request/create-branch.dto';
import { UpdateBranchDto } from './dto/request/update-branch.dto';
import { BranchResponseDto } from './dto/response/branch-response.dto';
import { DetailedBranchResponseDto } from './dto/response/detailed-branch-response.dto';
import { BranchEntity } from './entities/branch.entity';

@Injectable()
export class BranchService extends BaseEntityService<BranchEntity> {
  constructor(
    @InjectRepository(BranchEntity)
    repository: Repository<BranchEntity>,
    private readonly entityManager: EntityManager,
    private readonly documentService: DocumentService,
    @Inject(forwardRef(() => ProviderService))
    private readonly providerService: ProviderService,
    private readonly cityService: CityService,
    i18n: I18nService,
  ) {
    super(repository, i18n);
  }

  async create(
    createBranchDto: CreateBranchDto,
    user: ILoginUser,
  ): Promise<void> {
    const providerId = this.getAuthenticatedProviderId(user);

    // validate provider exists
    await this.providerService.findOneByOrFail({ where: { id: providerId } });

    // validate city exists
    await this.cityService.findOneByOrFail({
      where: { id: createBranchDto.cityId },
    });

    // validate logo document
    await this.validateLogoDocument(createBranchDto.logoId);

    // validate branch name uniqueness
    const existingBranch = await this.findOneBy({
      where: BranchTranslationMapper.toUniqueWhere(createBranchDto).map(
        (translatedNameClause) => ({
          ...translatedNameClause,
          providerId,
        }),
      ),
    });
    this.validateDuplicates(
      existingBranch,
      createBranchDto,
      BranchTranslationMapper.duplicateFieldsMapping,
      'branches.errors.duplicate',
    );

    const branchEntity = BranchTranslationMapper.toEntity(createBranchDto);
    branchEntity.providerId = providerId;

    await this.entityManager.transaction(async (entityManager) => {
      const savedBranch = await entityManager.save(BranchEntity, branchEntity);

      await this.documentService.markAsUsed(
        [createBranchDto.logoId],
        DocumentEntityTypeEnum.Branch,
        savedBranch.id,
        entityManager,
      );
    });
  }

  async findAll(
    query: PaginateQuery,
    user: ILoginUser,
  ): Promise<Paginated<BranchResponseDto>> {
    const authenticatedProviderId = this.resolveProviderScope(user);
    const sanitizedQuery = {
      ...query,
      search: query.search?.trim() || undefined,
    };

    const queryBuilder = this.repository
      .createQueryBuilder('branch')
      .leftJoinAndSelect('branch.city', 'city');

    if (authenticatedProviderId) {
      queryBuilder.where('branch.providerId = :providerId', {
        providerId: authenticatedProviderId,
      });
    }

    const result = await paginate(
      sanitizedQuery,
      queryBuilder,
      getBranchesPaginationConfig,
    );

    const mappedData = BranchTranslationMapper.toResponses(result.data);

    return { ...result, data: mappedData } as Paginated<BranchResponseDto>;
  }

  private resolveProviderScope(user: ILoginUser): string | undefined {
    if (user.type !== UserTypeEnum.PROVIDER) {
      return undefined;
    }

    if (!user.providerAdmin?.providerId) {
      throw new ForbiddenException(
        this.i18n.t('branches.errors.providerAssociationRequired'),
      );
    }

    return user.providerAdmin.providerId;
  }

  async createMainBranch(
    createBranchDto: CreateBranchDto,
    providerId: string,
    entityManager: EntityManager,
  ): Promise<void> {
    const branch = BranchTranslationMapper.toEntity(createBranchDto);
    branch.providerId = providerId;
    branch.isMainBranch = true;

    await entityManager.save(BranchEntity, branch);
  }

  async updateBranch(
    branch: BranchEntity,
    updateBranchDto: UpdateBranchDto,
    entityManager: EntityManager,
  ): Promise<void> {
    const updatedBranch = BranchTranslationMapper.toUpdateEntity(
      branch,
      updateBranchDto,
    );
    await entityManager.save(BranchEntity, updatedBranch);
  }

  async findOne(
    id: string,
    user: ILoginUser,
  ): Promise<DetailedBranchResponseDto> {
    const providerId = this.getAuthenticatedProviderId(user);

    const branch = await this.findOneByOrFail({
      where: { id, providerId },
      relations: { city: true, logo: true },
    });

    return BranchTranslationMapper.toDetailedResponse(branch);
  }

  private getAuthenticatedProviderId(user: ILoginUser): string {
    if (user.type !== UserTypeEnum.PROVIDER) {
      throw new ForbiddenException(this.i18n.t('common.errors.forbidden'));
    }

    if (!user.providerAdmin?.providerId) {
      throw new ForbiddenException(this.i18n.t('common.errors.forbidden'));
    }

    return user.providerAdmin.providerId;
  }

  // TODO: Move this validation to DocumentService and create a new method for validating document status and usage
  private async validateLogoDocument(logoId: string): Promise<void> {
    const logoDocument = await this.documentService.findOneByOrFail({
      where: { id: logoId },
    });
    if (logoDocument.entityId || logoDocument.isUsed) {
      throw new UnprocessableEntityException(
        this.i18n.t('branches.errors.logoAlreadyUsed'),
      );
    }
    if (logoDocument.status !== DocumentStatusEnum.Pending) {
      throw new UnprocessableEntityException(
        this.i18n.t('branches.errors.invalidLogo'),
      );
    }
  }
  protected getNotFoundMessage(): string {
    return this.i18n.t('branches.errors.notFound');
  }
}
