require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const devConfig = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'gymntonic_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  pool: { min: 2, max: 10 },
  migrations: {
    directory: require('path').resolve(__dirname, '../../database/migrations'),
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: require('path').resolve(__dirname, '../../database/seeds'),
  },
};

module.exports = {
  development: devConfig,
  test: devConfig,
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    pool: { min: 2, max: 20 },
    migrations: {
      directory: require('path').resolve(__dirname, '../../database/migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: require('path').resolve(__dirname, '../../database/seeds'),
    },
  },
};
