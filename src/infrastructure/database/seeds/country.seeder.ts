/* eslint-disable no-console */
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { CountryEntity } from 'src/modules/country/entities/country.entity';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface IRawCountry {
  english_name: string;
  arabic_name: string;
  alpha2_code: string;
  alpha3_code: string;
  phone_code: string;
}

export default class CountrySeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(CountryEntity);

    // Check if countries are already seeded
    const count = await repository.count();
    if (count > 0) {
      console.log('Country Seeder: Countries are already seeded.');
      return;
    }

    const filePath = path.join(
      process.cwd(),
      'src/infrastructure/database/seeds/data/countries.json',
    );
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const rawCountries: IRawCountry[] = JSON.parse(fileContent);

    const countries = rawCountries.map((c) => ({
      nameEn: c.english_name,
      nameAr: c.arabic_name,
      code: c.alpha2_code,
    }));

    const entities = repository.create(countries);
    await repository.save(entities);

    console.log('Country Seeder is seeded successfully');
  }
}
