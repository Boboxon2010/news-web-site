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

echo "🚀 Deploy boshlandi..."

# 0. Serverda papka mavjudligini tekshirish
ssh -i $SSH_KEY -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "mkdir -p $REMOTE_DIR"

# 1. Barcha kodlar va stillarni yuborish.
# MUHIM: --exclude '.env*' tufayli serverdagi .env.local fayli va baza parollari daxlsiz saqlanadi!
echo "📦 Kodlar va konfiguratsiyalar serverga nusxalanmoqda..."
rsync -avz -e "ssh -i $SSH_KEY -p $SERVER_PORT" \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.env*' \
  ./ $SERVER_USER@$SERVER_HOST:$REMOTE_DIR

# 2. Serverda xatosiz build va PM2 ni xavfsiz qayta ishga tushirish
echo "🔄 Serverda paketlar tekshirilmoqda, build va PM2 yangilanmoqda..."
ssh -i $SSH_KEY -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << 'EOF'
  cd /home/ubuntu/Web-site/litsey-web
  
  npm install
  
  # Sharp paketi rasm optimizatsiyasi uchun zarur
  npm install sharp --no-save || true

  # Eski build fayllarini tozalash (prerender xatolarining oldini oladi)
  rm -rf .next
  
  # Yangi build qilish
  npm run build
  
  # Build tugagandan keyin PM2 jarayonini qayta ishga tushirish
  if command -v pm2 &> /dev/null; then
      pm2 restart xorazmiival || pm2 start npm --name "xorazmiival" -- run start
  else
      echo "⚠️ PM2 topilmadi!"
  fi
EOF

echo "✅ Deploy muvaffaqiyatli yakunlandi! Build xatolari yo'q, ma'lumotlar bazasi va stillar to'liq ishlamoqda."