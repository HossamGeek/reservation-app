/* eslint-disable no-console */
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { NationalityEntity } from 'src/modules/nationality/entities/nationality.entity';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface IRawNationality {
  nameEn: string;
  nameAr: string;
}

export default class NationalitySeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(NationalityEntity);

    // Check if nationalities are already seeded
    const count = await repository.count();
    if (count > 0) {
      console.log('Nationality Seeder: Nationalities are already seeded.');
      return;
    }

    const filePath = path.join(
      process.cwd(),
      'src/infrastructure/database/seeds/data/nationalities.json',
    );
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const rawNationalities: IRawNationality[] = JSON.parse(fileContent);

    const nationalities = rawNationalities.map((n) => ({
      nameEn: n.nameEn,
      nameAr: n.nameAr,
      isActive: false,
    }));

    const entities = repository.create(nationalities);
    await repository.save(entities);

    console.log('Nationality Seeder is seeded successfully');
  }
}
