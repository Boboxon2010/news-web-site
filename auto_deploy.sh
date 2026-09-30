#!/bin/bash

echo "🚀 IIV Xorazm akademik litseyi saytini GitHub'ga yuklash boshlandi..."

# 1. Eski xato Git tarixini butunlay o'chirish (Kesh va og'ir fayllardan qutulish)
echo "🧹 Eski Git kesh va tarixini tozalamoqdamiz..."
rm -rf .git

# 2. Toza .gitignore faylini yaratish va ichini to'ldirish
echo "📝 .gitignore fayli yaratilmoqda..."
cat << 'EOF' > .gitignore
node_modules/
.next/
out/
build/
.env
.env.local
.env.production
.env.development
.env.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
EOF

# 3. GitHub Actions papkasini va test faylini avtomatik yaratish
echo "⚙️ GitHub Actions CI/CD test ssenariysi o'rnatilmoqda..."
mkdir -p .github/workflows

cat << 'EOF' > .github/workflows/deploy.yml
name: Test Next.js Build on GitHub Actions

on:
  push:
    branches:
      - main

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: GitHub-dan kodingizni yuklab olish
        uses: actions/checkout@v4

      - name: Node.js muhitini o'rnatish
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'

      - name: Kerakli paketlarni (node_modules) o'rnatish
        run: npm install

      - name: Next.js loyihasini ishlab chiqarishga tayyorlash (Build)
        run: npm run build

      - name: Loyihani sinov uchun fonda ishga tushirish
        run: |
          npm run start & 
          echo "Next.js vaqtincha fonda ishga tushirildi!"
          sleep 10

      - name: Sayt ishlayotganini ichki tekshirish (Health Check)
        run: |
          curl -I http://localhost:3000 || exit 1
          echo "Ajoyib! Sayt xatosiz start oldi."
EOF

# 4. Gitni noldan boshlash va fayllarni yangidan qo'shish
echo "📂 Fayllarni indeksatsiya qilish..."
git init
git branch -m main
git add .

# 5. Birinchi toza commitni amalga oshirish
echo "💾 Toza commit yaratilmoqda..."
git commit -m "Initial clean commit: Next.js project with auto testing workflow"

# 6. GitHub repozitoriyasini ulash
echo "🔗 GitHub ombori ulanmoqda..."
git remote add origin https://github.com/Boboxon2010/news-web-site.git

# 7. Kodni GitHub'ga majburiy (Force push) yuborish
echo "📤 Kod GitHub'ga yuklanmoqda..."
git push -u -f origin main

echo "✅ Muvaffaqiyatli yakunlandi! Endi GitHub sahifangizdagi 'Actions' bo'limidan jarayonni kuzatishingiz mumkin."
