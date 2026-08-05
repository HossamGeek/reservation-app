/* eslint-disable no-console */
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Skill } from 'src/modules/skills/entities/skill.entity';

interface IRawSkill {
  english_name: string;
  arabic_name: string;
}

export default class SkillsSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(Skill);

    const filePath = path.join(
      process.cwd(),
      'src/infrastructure/database/seeds/skills/data.json',
    );
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const rawSkills: IRawSkill[] = JSON.parse(fileContent);

    await repository.upsert(
      rawSkills.map((skill) => ({
        nameEn: skill.english_name,
        nameAr: skill.arabic_name,
        isActive: false,
      })),
      ['nameEn'],
    );

    console.log('Skills Seeder is seeded successfully');
  }
}
