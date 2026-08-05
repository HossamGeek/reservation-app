/* eslint-disable no-console */
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { PositionEntity } from 'src/modules/position/entities/position.entity';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface IRawPosition {
  nameEn: string;
  nameAr: string;
}

export default class PositionSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(PositionEntity);

    const filePath = path.join(
      process.cwd(),
      'src/infrastructure/database/seeds/data/positions.json',
    );
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const rawPositions: IRawPosition[] = JSON.parse(fileContent);

    // Fetch existing positions to ensure idempotency
    const existingPositions = await repository.find();
    const existingEnNames = new Set(
      existingPositions.map((p) => p.nameEn.toLowerCase()),
    );
    const existingArNames = new Set(
      existingPositions.map((p) => p.nameAr.toLowerCase()),
    );

    const positionsToSave = rawPositions
      .filter(
        (p) =>
          !existingEnNames.has(p.nameEn.toLowerCase()) &&
          !existingArNames.has(p.nameAr.toLowerCase()),
      )
      .map((p) => ({
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        isActive: false,
      }));

    if (positionsToSave.length === 0) {
      console.log('Position Seeder: All positions are already seeded.');
      return;
    }

    const entities = repository.create(positionsToSave);
    await repository.save(entities);

    console.log(`Position Seeder: Seeded ${positionsToSave.length} positions successfully.`);
  }
}
