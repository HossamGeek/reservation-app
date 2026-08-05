/* eslint-disable no-console */
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { ExperienceEntity } from 'src/modules/experience/entities/experience.entity';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface IRawExperience {
  minYears: number;
  maxYears: number | null;
}

export default class ExperienceSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(ExperienceEntity);

    const filePath = path.join(
      process.cwd(),
      'src/infrastructure/database/seeds/data/experiences.json',
    );
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const rawExperiences: IRawExperience[] = JSON.parse(fileContent);

    // Fetch existing experiences to ensure idempotency
    const existingExperiences = await repository.find();
    const existingKeys = new Set(
      existingExperiences.map((e) => `${e.minYears}-${e.maxYears ?? 'null'}`),
    );

    const experiencesToSave = rawExperiences
      .filter((e) => !existingKeys.has(`${e.minYears}-${e.maxYears ?? 'null'}`))
      .map((e) => ({
        minYears: e.minYears,
        maxYears: e.maxYears,
      }));

    if (experiencesToSave.length === 0) {
      console.log('Experience Seeder: All experience ranges are already seeded.');
      return;
    }

    const entities = repository.create(experiencesToSave);
    await repository.save(entities);

    console.log(`Experience Seeder: Seeded ${experiencesToSave.length} experience ranges successfully.`);
  }
}
