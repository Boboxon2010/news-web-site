#!/bin/bash

set -e

SERVER_USER="ubuntu"
SERVER_HOST="xorazmiival.uz"
SERVER_PORT="22"
SSH_KEY="/home/boboxon/Web-site/litsey2026.pem"
REMOTE_DIR="/home/ubuntu/Web-site/litsey-web"
SITE_URL="https://xorazmiival.uz"

echo "🚀 Deploy boshlandi..."

ssh -i "$SSH_KEY" -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" "mkdir -p $REMOTE_DIR"

echo "📦 Kodlar va konfiguratsiyalar serverga nusxalanmoqda..."
rsync -avz -e "ssh -i $SSH_KEY -p $SERVER_PORT" \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.env*' \
  ./ "$SERVER_USER@$SERVER_HOST:$REMOTE_DIR"

echo "🔄 Serverda build va PM2 yangilanmoqda..."
ssh -i "$SSH_KEY" -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" <<EOF
  cd /home/ubuntu/Web-site/litsey-web
  export NEXT_PUBLIC_SITE_URL="$SITE_URL"

  npm install
  npm install sharp --no-save || true
  rm -rf .next
  npm run build

  sudo python3 - <<'PY'
from pathlib import Path

config_path = Path('/etc/nginx/sites-available/litsey-web')
if not config_path.exists():
    raise SystemExit('Nginx config topilmadi: /etc/nginx/sites-available/litsey-web')

config = config_path.read_text()
required = """        client_max_body_size 0;
        proxy_request_buffering off;
        proxy_read_timeout 1h;
        proxy_send_timeout 1h;
"""
marker = "        proxy_cache_bypass $http_upgrade;\n"
if required not in config:
    config = config.replace(marker, marker + required)
    config_path.write_text(config)
PY

  sudo nginx -t
  sudo systemctl reload nginx

  if command -v pm2 >/dev/null 2>&1; then
    pm2 restart xorazmiival || pm2 start npm --name "xorazmiival" -- run start
  else
    echo "⚠️ PM2 topilmadi!"
  fi
EOF

echo "✅ Deploy yakunlandi. Sitemap va HTTPS konfiguratsiyasi yangilandi."
