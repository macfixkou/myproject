#!/bin/bash

echo "=== Cloudflare API Token 設定スクリプト ==="
echo ""

# APIトークンの入力を促す
echo "Cloudflare API Tokenを入力してください:"
echo "（https://dash.cloudflare.com/profile/api-tokens で取得）"
echo ""
read -p "API Token: " CLOUDFLARE_API_TOKEN

# 空でないことを確認
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ APIトークンが入力されていません"
    exit 1
fi

# 環境変数を設定
export CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN"

# .bashrcに永続化
echo "export CLOUDFLARE_API_TOKEN=\"$CLOUDFLARE_API_TOKEN\"" >> ~/.bashrc

echo ""
echo "✅ APIトークンを設定しました"
echo ""

# 設定確認
echo "=== 設定確認 ==="
./check-cloudflare-env.sh

echo ""
echo "=== 次のステップ ==="
echo "1. Wrangler認証: npx wrangler auth whoami"
echo "2. プロジェクトビルド: npm run build"
echo "3. デプロイテスト: npx wrangler pages deploy .next"
