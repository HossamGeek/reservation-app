/* eslint-disable no-console */
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { LanguageEntity } from 'src/modules/languages/entities/language.entity';

interface IRawLanguage {
  english_name: string;
  arabic_name: string;
}

export default class LanguagesSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(LanguageEntity);

    const filePath = path.join(
      process.cwd(),
      'src/infrastructure/database/seeds/languages/data.json',
    );
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const rawLanguages: IRawLanguage[] = JSON.parse(fileContent);

   await repository.upsert(
      rawLanguages.map((skill) => ({
        nameEn: skill.english_name,
        nameAr: skill.arabic_name,
        isActive: false,
      })),
      ['nameEn'],
    );

    console.log('Languages Seeder is seeded successfully');
  }
}
