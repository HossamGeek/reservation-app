/* eslint-disable no-console */
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { ReligionEntity } from 'src/modules/religion/entities/religion.entity';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface IRawReligion {
  nameEn: string;
  nameAr: string;
}

export default class ReligionSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(ReligionEntity);

    const filePath = path.join(
      process.cwd(),
      'src/infrastructure/database/seeds/data/religions.json',
    );
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const rawReligions: IRawReligion[] = JSON.parse(fileContent);

    // Fetch existing religions to ensure idempotency
    const existingReligions = await repository.find();
    const existingEnNames = new Set(
      existingReligions.map((r) => r.nameEn.toLowerCase()),
    );
    const existingArNames = new Set(
      existingReligions.map((r) => r.nameAr.toLowerCase()),
    );

    const religionsToSave = rawReligions
      .filter(
        (r) =>
          !existingEnNames.has(r.nameEn.toLowerCase()) &&
          !existingArNames.has(r.nameAr.toLowerCase()),
      )
      .map((r) => ({
        nameEn: r.nameEn,
        nameAr: r.nameAr,
        isActive: false, // Seeded religions should be active by default
      }));

    if (religionsToSave.length === 0) {
      console.log('Religion Seeder: All religions are already seeded.');
      return;
    }

    const entities = repository.create(religionsToSave);
    await repository.save(entities);

    console.log(`Religion Seeder: Seeded ${religionsToSave.length} religions successfully.`);
  }
}
