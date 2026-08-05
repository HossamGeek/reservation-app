import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const getDataSourceOptions = (): DataSourceOptions => {
    return {
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        entities: ['dist/**/*.entity.js'],
        migrations: ['dist/infrastructure/database/migrations/*.js'],
        synchronize: false,
        migrationsRun: false,
        logging: process.env.NODE_ENV === 'DEV' ? true : false,
    };
};

export const dataSource = new DataSource(getDataSourceOptions());
