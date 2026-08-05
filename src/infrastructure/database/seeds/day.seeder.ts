/* eslint-disable no-console */
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { DayEntity } from 'src/modules/day/entities/day.entity';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface IRawDay {
  sortOrder: number;
  nameAr: string;
  nameEn: string;
}

export default class DaySeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(DayEntity);

    const filePath = path.join(
      process.cwd(),
      'src/infrastructure/database/seeds/data/days.json',
    );
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const rawDays: IRawDay[] = JSON.parse(fileContent);

    // Fetch existing days to ensure idempotency
    const existingDays = await repository.find();
    const existingEnNames = new Set(
      existingDays.map((d) => d.nameEn.toLowerCase()),
    );
    const existingArNames = new Set(
      existingDays.map((d) => d.nameAr.toLowerCase()),
    );

    const daysToSave = rawDays
      .filter(
        (d) =>
          !existingEnNames.has(d.nameEn.toLowerCase()) &&
          !existingArNames.has(d.nameAr.toLowerCase()),
      )
      .map((d) => ({
        nameEn: d.nameEn,
        nameAr: d.nameAr,
        sortOrder: d.sortOrder,
      }));

    if (daysToSave.length === 0) {
      console.log('Day Seeder: All days are already seeded.');
      return;
    }

    const entities = repository.create(daysToSave);
    await repository.save(entities);

    console.log(`Day Seeder: Seeded ${daysToSave.length} days successfully.`);
  }
}
