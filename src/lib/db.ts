import { Pool, QueryResult } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/litsey_db',
});

// Jadval mavjud bo'lmasa avtomatik yaratish
const initDb = async () => {
  try {
    await Promise.all([
      pool.query(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id SERIAL PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          email VARCHAR(255) NOT NULL DEFAULT '',
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS email VARCHAR(255) NOT NULL DEFAULT '';
      `),
      pool.query(`
        ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20) NOT NULL DEFAULT '';
        ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_title TEXT NOT NULL DEFAULT '';
        ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_subtitle TEXT NOT NULL DEFAULT '';
        ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS news_title TEXT NOT NULL DEFAULT '';
        ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS news_subtitle TEXT NOT NULL DEFAULT '';
      `),
      pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;`),
      pool.query(`
        CREATE TABLE IF NOT EXISTS site_visits (
          visitor_key VARCHAR(64) NOT NULL,
          week_start DATE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (visitor_key, week_start)
        );
      `),
    ]);
  } catch (err) {
    console.error("DB Initialization Error:", err);
  }
};

const databaseReady = initDb();

export const query = async (text: string, params?: any[]): Promise<QueryResult<any>> => {
  await databaseReady;
  return pool.query(text, params);
};

export default pool;
