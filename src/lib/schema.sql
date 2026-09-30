-- 1. ADMINLAR JADVALI
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Boshlang'ich standart admin ma'lumotlari
INSERT INTO admins (username, email, phone, password_hash)
VALUES ('admin', 'admin@iiv-litsey.uz', '+998901234567', 'admin')
ON CONFLICT (username) DO NOTHING;


-- 2. SAYT GLOBAL SOZLAMALARI JADVALI
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    hero_title TEXT NOT NULL,
    hero_subtitle TEXT NOT NULL,
    badge_text TEXT NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    working_hours VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20) NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS site_visits (
    visitor_key VARCHAR(64) NOT NULL,
    week_start DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (visitor_key, week_start)
);

-- Boshlang'ich standart sayt ma'lumotlari
INSERT INTO site_settings (hero_title, hero_subtitle, badge_text, address, phone, email, working_hours, postal_code)
VALUES (
    'O''zbekiston Respublikasi IIV Xorazm akademik litseyi',
    'Kelajak posbonlari va bilimli yoshlarni tarbiyalash maskani. Litsey faoliyatiga oid rasmiy axborotlar va yangiliklar minbari.',
    'O''zbekiston Respublikasi Ichki Ishlar Vazirligi Tizimidagi Muassasa',
    'Xorazm viloyati, Urganch shahri',
    '',
    '',
    '',
    ''
);


-- 3. YANGILIKLAR JADVALI
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Tadbirlar',
    news_date VARCHAR(50) NOT NULL,
    short_desc TEXT,
    full_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 4. YANGILIKLAR RASMLARI JADVALI (FOREIGN KEY)
CREATE TABLE IF NOT EXISTS news_images (
    id SERIAL PRIMARY KEY,
    news_id INT NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 5. YANGILIKLARGA BIRIKTIRILGAN FAYLLAR JADVALI (FOREIGN KEY)
CREATE TABLE IF NOT EXISTS news_files (
    id SERIAL PRIMARY KEY,
    news_id INT NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(20) NOT NULL DEFAULT 'doc', -- 'pdf', 'txt', 'doc'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 6. RAHBARIYAT JADVALI
CREATE TABLE IF NOT EXISTS leaders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(150) NOT NULL,
    spec TEXT,
    photo_url TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 7. STATISTIKA JADVALI
CREATE TABLE IF NOT EXISTS stats (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    value VARCHAR(50) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- INDEKSLAR (Tezkor qidiruv va so'rovlar uchun)
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_images_news_id ON news_images(news_id);
CREATE INDEX IF NOT EXISTS idx_news_files_news_id ON news_files(news_id);