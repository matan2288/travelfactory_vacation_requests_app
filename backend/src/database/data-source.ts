import 'reflect-metadata';
import { types } from 'pg';
import { DataSource } from 'typeorm';
import { env } from '../config/env';
import { User } from './entities/user.entity';
import { VacationRequest } from './entities/vacation-request.entity';
import { InitialSchema1760353200000 } from './migrations/1760353200000-InitialSchema';

const PG_DATE_OID = 1082;
// Keep DATE columns as 'YYYY-MM-DD' strings instead of local-midnight JS Dates (avoids timezone drift).
types.setTypeParser(PG_DATE_OID, (value) => value);

let dataSource: DataSource | undefined;

/** Lazily built so env validation happens after `loadEnv()`, not at import time. */
export function getDataSource(): DataSource {
  dataSource ??= new DataSource({
    type: 'postgres',
    url: env().DATABASE_URL,
    entities: [User, VacationRequest],
    migrations: [InitialSchema1760353200000],
    synchronize: false,
    logging: ['error'],
  });
  return dataSource;
}

/** Initializes the shared connection pool once; safe to call on every Lambda invocation. */
export async function initDataSource(): Promise<DataSource> {
  const ds = getDataSource();
  if (!ds.isInitialized) await ds.initialize();
  return ds;
}
