/* eslint-disable no-console */
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { CityEntity } from 'src/modules/city/entities/city.entity';
import { CountryEntity } from 'src/modules/country/entities/country.entity';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface IRawCity {
  english_name: string;
  arabic_name: string;
  country_alpha2_code: string;
}

export default class CitySeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const cityRepository = dataSource.getRepository(CityEntity);
    const countryRepository = dataSource.getRepository(CountryEntity);

    // Check if cities are already seeded
    const count = await cityRepository.count();
    if (count > 0) {
      console.log('City Seeder: Cities are already seeded.');
      return;
    }

    // Load countries to map code -> id
    const countries = await countryRepository.find({
      select: ['id', 'code'],
    });

    const countryMap = new Map<string, string>();
    for (const country of countries) {
      if (country.code) {
        countryMap.set(country.code.toUpperCase(), country.id);
      }
    }

    const filePath = path.join(
      process.cwd(),
      'src/infrastructure/database/seeds/data/cities.json',
    );
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const rawCities: IRawCity[] = JSON.parse(fileContent);

    const citiesToSave: Partial<CityEntity>[] = [];
    const missingCountries = new Set<string>();

    for (const raw of rawCities) {
      const code = raw.country_alpha2_code.toUpperCase();
      const countryId = countryMap.get(code);

      if (!countryId) {
        missingCountries.add(code);
        continue;
      }

      citiesToSave.push({
        nameEn: raw.english_name,
        nameAr: raw.arabic_name,
        countryId,
        isActive: false, // Seeded cities are active by default
      });
    }

    if (missingCountries.size > 0) {
      console.warn(
        `City Seeder Warning: Missing country IDs for codes: ${Array.from(missingCountries).join(', ')}`,
      );
    }

    // Save cities in chunks to prevent database parameter limits
    const chunkSize = 200;
    for (let i = 0; i < citiesToSave.length; i += chunkSize) {
      const chunk = citiesToSave.slice(i, i + chunkSize);
      const entities = cityRepository.create(chunk);
      await cityRepository.save(entities);
    }

    console.log(`City Seeder: Seeded ${citiesToSave.length} cities successfully.`);
  }
}
