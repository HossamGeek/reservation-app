import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { BaseEntityFinderService } from 'src/libs/base-service/base-entity-finder.service';
import { IFindBy } from 'src/libs/interfaces/entity-reader.interface';
import { DayTranslationMapper } from 'src/libs/mappers/day-translation.mapper';
import { FindManyOptions, Repository } from 'typeorm';
import { DayResponseDto } from './dto/response/day-response.dto';
import { DayEntity } from './entities/day.entity';

@Injectable()
export class DayService
  extends BaseEntityFinderService<DayEntity>
  implements IFindBy<DayEntity>
{
  constructor(
    @InjectRepository(DayEntity)
    repository: Repository<DayEntity>,
    i18n: I18nService,
  ) {
    super(repository, i18n);
  }

  async findBy(
    options: FindManyOptions<DayEntity>,
  ): Promise<DayEntity[] | null> {
    return await this.repository.find(options);
  }

  async findAll(): Promise<DayResponseDto[]> {
    const days = await this.repository.find({
      order: {
        sortOrder: 'ASC',
      },
    });

    return DayTranslationMapper.toResponses(days);
  }
  protected getNotFoundMessage(): string {
    return this.i18n.t('days.errors.notFound');
  }
}
