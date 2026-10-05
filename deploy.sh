#!/usr/bin/env bash
set -Eeuo pipefail

LOCAL_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SSH_KEY="${SSH_KEY_PATH:-$HOME/Web-site/litsey2026.pem}"
REMOTE_HOST="${DEPLOY_USER:-ubuntu}@${DEPLOY_HOST:-89.126.221.4}"
REMOTE_DIR='litsey-web'

if ! command -v rsync >/dev/null 2>&1; then
  printf 'Error: rsync is required locally.\n' >&2
  exit 1
fi

if [[ ! -r "$SSH_KEY" ]]; then
  printf 'Error: SSH key is not readable: %s\n' "$SSH_KEY" >&2
  exit 1
fi

SSH_COMMAND="ssh -i '$SSH_KEY' -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"

printf 'Uploading project files to %s:%s ...\n' "$REMOTE_HOST" "$REMOTE_DIR"
rsync -az --info=progress2 \
  --exclude='/.env' \
  --exclude='/.env.*' \
  --exclude='/.next/' \
  --exclude='/node_modules/' \
  --exclude='/.git/' \
  --exclude='/coverage/' \
  --exclude='/*.log' \
  -e "$SSH_COMMAND" \
  "$LOCAL_DIR/" "$REMOTE_HOST:$REMOTE_DIR/"

printf 'Building and restarting %s on the server ...\n' "$REMOTE_HOST"
ssh -i "$SSH_KEY" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new "$REMOTE_HOST" \
  "cd ~/litsey-web && npm ci && npm run build && pm2 restart xorazmiival --update-env"

printf 'Deployment completed successfully.\n'