/* eslint-disable no-console */
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ServiceTypeEntity } from 'src/modules/category/entities/service-type.entity';
import { ServiceType } from 'src/libs/enums/service-type.enum';

interface IRawServiceType {
  nameEn: string;
  nameAr: string;
  supportsOptions: boolean;
  type: ServiceType;
}

export default class ServiceTypeSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(ServiceTypeEntity);

    const filePath = path.join(
      process.cwd(),
      'src/infrastructure/database/seeds/data/services-types.json',
    );
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const rawServiceTypes: IRawServiceType[] = JSON.parse(fileContent);

    // Fetch existing service types to ensure idempotency
    const existingServiceTypes = await repository.find();
    const existingEnNames = new Set(
      existingServiceTypes.map((st) => st.nameEn.toLowerCase()),
    );
    const existingArNames = new Set(
      existingServiceTypes.map((st) => st.nameAr.toLowerCase()),
    );

    const serviceTypesToSave = rawServiceTypes
      .filter(
        (st) =>
          !existingEnNames.has(st.nameEn.toLowerCase()) &&
          !existingArNames.has(st.nameAr.toLowerCase()),
      )
      .map((st) => ({
        nameEn: st.nameEn,
        nameAr: st.nameAr,
        supportsOptions: st.supportsOptions,
        type: st.type,
        isActive: false,
      }));

    if (serviceTypesToSave.length === 0) {
      console.log('Service Type Seeder: All service types are already seeded.');
      return;
    }

    const entities = repository.create(serviceTypesToSave);
    await repository.save(entities);

    console.log(
      `Service Type Seeder: Seeded ${serviceTypesToSave.length} service types successfully.`,
    );
  }
}
