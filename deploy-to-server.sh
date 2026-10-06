#!/bin/bash

# Xatolik chiqqanda to'xtash
set -e

# --- SOZLAMALAR ---
SERVER_USER="ubuntu"
SERVER_HOST="xorazmiival.uz"
SERVER_PORT="22"
SSH_KEY="litsey2026.pem"
REMOTE_DIR="/home/ubuntu/Web-site/litsey-web"
# ------------------

echo "🚀 Faqat kod fayllarini (config va bazalarsiz) serverga yuborish boshlandi..."

# rsync orqali config va bazaga tegishli fayllarni to'liq chetlab o'tib yuborish
rsync -avz -e "ssh -i $SSH_KEY -p $SERVER_PORT" \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.env*' \
  --exclude 'config/' \
  --exclude 'src/lib/db.ts' \
  --exclude 'src/lib/db.*' \
  --exclude 'db.config.*' \
  --exclude 'next.config.*' \
  --exclude 'tailwind.config.*' \
  --exclude 'tsconfig.json' \
  ./ $SERVER_USER@$SERVER_HOST:$REMOTE_DIR

# Serverda build qilish va PM2 orqali yangilash (serverdagi configlar joyida qoladi)
echo "🔄 Serverda build qilinmoqda va ilova qayta ishga tushirilmoqda..."
ssh -i $SSH_KEY -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << 'EOF'
  cd /home/ubuntu/Web-site/litsey-web
  
  npm install
  rm -rf .next
  npm run build
  
  if command -v pm2 &> /dev/null; then
      pm2 restart litsey-web || pm2 start npm --name "litsey-web" -- run start
  else
      echo "⚠️ PM2 topilmadi!"
  fi
EOF

echo "✅ Deploy muvaffaqiyatli yakunlandi! Serverdagi barcha config va bazalar o'z holicha saqlandi."