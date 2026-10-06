#!/bin/bash

# Xatolik chiqqanda to'xtash
set -e

# --- SOZLAMALAR ---
SERVER_USER="ubuntu"
SERVER_HOST="xorazmiival.uz"
SERVER_PORT="22"
SSH_KEY="/home/boboxon/Web-site/litsey2026.pem"
REMOTE_DIR="/home/ubuntu/Web-site/litsey-web"
# ------------------

echo "🚀 Faqat kod fayllarini (database va asosiy server configlariga tegmagan holda) yuborish boshlandi..."

# 0. Serverda kerakli papka mavjudligini tekshirish va yaratish
echo "📁 Serverda papka mavjudligi tekshirilmoqda..."
ssh -i $SSH_KEY -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "mkdir -p $REMOTE_DIR"

# 1. rsync orqali faqat database va maxfiy configlarni chetlab o'tish (qolgan barcha lib, hooks, components to'liq boradi)
echo "📦 Fayllar serverga nusxalanmoqda..."
rsync -avz -e "ssh -i $SSH_KEY -p $SERVER_PORT" \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.env*' \
  --exclude 'src/lib/db.ts' \
  --exclude 'src/lib/db.js' \
  --exclude 'src/lib/db.*' \
  --exclude 'db.config.*' \
  --exclude 'next.config.*' \
  --exclude 'tailwind.config.*' \
  --exclude 'tsconfig.json' \
  ./ $SERVER_USER@$SERVER_HOST:$REMOTE_DIR

# 2. Serverda build qilish va PM2 orqali 'xorazmiival' nomida yangilash
echo "🔄 Serverda build qilinmoqda va ilova qayta ishga tushirilmoqda..."
ssh -i $SSH_KEY -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << 'EOF'
  cd /home/ubuntu/Web-site/litsey-web
  
  npm install
  rm -rf .next
  npm run build
  
  if command -v pm2 &> /dev/null; then
      pm2 restart xorazmiival || pm2 start npm --name "xorazmiival" -- run start
  else
      echo "⚠️ PM2 topilmadi!"
  fi
EOF

echo "✅ Deploy muvaffaqiyatli yakunlandi! Database va muhim server configlari o'z joyida daxlsiz qoldi."