/* eslint-disable no-console */
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CategoryEntity } from 'src/modules/category/entities/category.entity';

interface IRawCategory {
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
}

export default class CategorySeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(CategoryEntity);

    const filePath = path.join(
      process.cwd(),
      'src/infrastructure/database/seeds/data/categories.json',
    );
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const rawCategories: IRawCategory[] = JSON.parse(fileContent);

    // Fetch existing categories to ensure idempotency
    const existingCategories = await repository.find();
    const existingEnNames = new Set(
      existingCategories.map((c) => c.nameEn.toLowerCase()),
    );
    const existingArNames = new Set(
      existingCategories.map((c) => c.nameAr.toLowerCase()),
    );

    const categoriesToSave = rawCategories
      .filter(
        (c) =>
          !existingEnNames.has(c.nameEn.toLowerCase()) &&
          !existingArNames.has(c.nameAr.toLowerCase()),
      )
      .map((c) => ({
        nameEn: c.nameEn,
        nameAr: c.nameAr,
        descriptionEn: c.descriptionEn,
        descriptionAr: c.descriptionAr,
        isActive: false,
      }));

    if (categoriesToSave.length === 0) {
      console.log('Category Seeder: All categories are already seeded.');
      return;
    }

    const entities = repository.create(categoriesToSave);
    await repository.save(entities);

    console.log(
      `Category Seeder: Seeded ${categoriesToSave.length} categories successfully.`,
    );
  }
}
