/* eslint-disable no-console */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ServiceTypeOption } from 'src/libs/enums/service-type-option.enum';
import { ServiceTypeOptionEntity } from 'src/modules/category/entities/service-type-option.entity';
import { ServiceTypeEntity } from 'src/modules/category/entities/service-type.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

interface IRawServiceTypeOption {
  nameEn: string;
  nameAr: string;
  type: ServiceTypeOption;
}

export default class ServiceTypeOptionSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const serviceTypeOptionRepository = dataSource.getRepository(
      ServiceTypeOptionEntity,
    );

    const serviceTypeRepository = dataSource.getRepository(ServiceTypeEntity);

    const filePath = path.join(
      process.cwd(),
      'src/infrastructure/database/seeds/data/service-type-options.json',
    );
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const rawServiceTypesOptions: IRawServiceTypeOption[] =
      JSON.parse(fileContent);

    const hourlyServiceTypeEntity = await serviceTypeRepository.findOne({
      where: { nameEn: 'Hourly', supportsOptions: true },
    });

    if (!hourlyServiceTypeEntity) {
      console.error(
        'Service Type Option Seeder: Hourly service type not found. Please seed service types first.',
      );
      return;
    }

    // Fetch existing service types to ensure idempotency
    const existingServiceTypeOptions = await serviceTypeOptionRepository.find();
    const existingEnNames = new Set(
      existingServiceTypeOptions.map((st) => st.nameEn.toLowerCase()),
    );
    const existingArNames = new Set(
      existingServiceTypeOptions.map((st) => st.nameAr.toLowerCase()),
    );

    const serviceTypeOptionsToSave = rawServiceTypesOptions
      .filter(
        (st) =>
          !existingEnNames.has(st.nameEn.toLowerCase()) &&
          !existingArNames.has(st.nameAr.toLowerCase()),
      )
      .map((st) => ({
        nameEn: st.nameEn,
        nameAr: st.nameAr,
        serviceType: hourlyServiceTypeEntity,
        type: st.type,
        isActive: false,
      }));

    if (serviceTypeOptionsToSave.length === 0) {
      console.log(
        'Service Type Option Seeder: All service type options are already seeded.',
      );
      return;
    }

    const entities = serviceTypeOptionRepository.create(
      serviceTypeOptionsToSave,
    );
    await serviceTypeOptionRepository.save(entities);

    console.log(
      `Service Type Option Seeder: Seeded ${serviceTypeOptionsToSave.length} service type options successfully.`,
    );
  }
}
