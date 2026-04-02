#!/usr/bin/env bash
# ============================================================
#  Audio-to-MIDI 前端 Demo — Vercel 一键部署脚本
#  在你的本地机器上运行（需要 Node.js 18+）
#  用法: bash deploy.sh [你的VERCEL_TOKEN]
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================"
echo "  🎵 Audio-to-MIDI 部署到 Vercel"
echo "============================================"

# ---- 1. 检查 Node.js ----
if ! command -v node &>/dev/null; then
  echo "❌ 未找到 Node.js，请先安装 Node.js 18+"
  exit 1
fi
NODE_MAJOR=$(node -v | cut -d. -f1 | tr -d 'v')
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "❌ Node.js 版本过低（当前 v$(node -v)），需要 18+"
  exit 1
fi
echo "✅ Node.js $(node -v)"

# ---- 2. 检查 Vercel CLI ----
if ! command -v vercel &>/dev/null; then
  echo "📦 安装 Vercel CLI..."
  npm i -g vercel
fi
echo "✅ Vercel CLI $(vercel --version)"

# ---- 3. 检查 Token ----
if [ -n "${1:-}" ]; then
  TOKEN="$1"
elif [ -n "${VERCEL_TOKEN:-}" ]; then
  TOKEN="$VERCEL_TOKEN"
else
  echo ""
  echo "⚠️  需要一个 Vercel Token 来部署。"
  echo ""
  echo "  获取方式："
  echo "    1. 打开 https://vercel.com/account/tokens"
  echo "    2. 创建一个 token（scope 选 Full Account 或只读也行）"
  echo "    3. 复制 token"
  echo ""
  echo "  然后运行："
  echo "    bash deploy.sh YOUR_TOKEN_HERE"
  echo "    # 或者"
  echo "    VERCEL_TOKEN=YOUR_TOKEN_HERE bash deploy.sh"
  echo ""
  exit 1
fi

# ---- 4. 安装依赖 ----
echo ""
echo "📦 安装项目依赖..."
npm install --prefer-offline

# ---- 5. 构建 ----
echo ""
echo "🔨 构建项目..."
npx vite build
echo "✅ 构建完成"

# ---- 6. 部署 ----
echo ""
echo "🚀 部署到 Vercel (Preview)..."
DEPLOY_OUTPUT=$(npx vercel deploy --yes --public --token "$TOKEN" 2>&1)
echo "$DEPLOY_OUTPUT"

# ---- 7. 提取 URL ----
PREVIEW_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[a-zA-Z0-9][-a-zA-Z0-9]*\.vercel\.app' | head -1)

if [ -n "$PREVIEW_URL" ]; then
  echo ""
  echo "============================================"
  echo "  ✅ 部署成功！"
  echo "============================================"
  echo ""
  echo "  🌐 Preview URL: $PREVIEW_URL"
  echo ""
  echo "  ⚠️  这是 Preview 部署，URL 可能在几天后失效。"
  echo "     要生产部署（固定域名），运行："
  echo "       vercel --prod --token $TOKEN"
  echo ""
else
  echo ""
  echo "⚠️  部署似乎已发送但未提取到 URL，请检查 Vercel Dashboard。"
  echo ""
fi
