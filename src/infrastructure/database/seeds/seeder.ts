/* eslint-disable no-console */
import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';
import { getDataSourceOptions } from '../datasource';
import CountrySeeder from './country.seeder';
import CitySeeder from './city.seeder';
import NationalitySeeder from './nationality.seeder';
import PositionSeeder from './position.seeder';
import SkillsSeeder from './skills/skills.seeder';
import LanguagesSeeder from './languages/languages.seeder';
import ReligionSeeder from './religion.seeder';
import ExperienceSeeder from './experience.seeder';
import CategorySeeder from './category.seeder';
import ServiceTypeSeeder from './service-type.seeder';
import ServiceTypeOptionSeeder from './service-type-option.seeder';
import DaySeeder from './day.seeder';

const options = getDataSourceOptions();

const dataSource = new DataSource({
  ...options,
});

dataSource
  .initialize()
  .then(async () => {
    console.log('Database connected successfully. Running seeders...');
    await runSeeders(dataSource, {
      seeds: [
        CountrySeeder,
        CitySeeder,
        NationalitySeeder,
        PositionSeeder,
        ReligionSeeder,
        ExperienceSeeder,
        SkillsSeeder,
        LanguagesSeeder,
        CategorySeeder,
        ServiceTypeSeeder,
        ServiceTypeOptionSeeder,
        DaySeeder,
      ],
    });
    console.log('Seeders completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error during seeding:', err);
    process.exit(1);
  });
