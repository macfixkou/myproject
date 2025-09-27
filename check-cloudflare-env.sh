#!/bin/bash

echo "=== Cloudflare環境変数チェック ==="
echo ""

if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    echo "✅ CLOUDFLARE_API_TOKEN: 設定済み (${#CLOUDFLARE_API_TOKEN}文字)"
else
    echo "❌ CLOUDFLARE_API_TOKEN: 未設定"
fi

if [ -n "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo "✅ CLOUDFLARE_ACCOUNT_ID: 設定済み"
else
    echo "❌ CLOUDFLARE_ACCOUNT_ID: 未設定"
fi

if [ -n "$CLOUDFLARE_EMAIL" ]; then
    echo "✅ CLOUDFLARE_EMAIL: $CLOUDFLARE_EMAIL"
else
    echo "❌ CLOUDFLARE_EMAIL: 未設定"
fi

if [ -n "$CLOUDFLARE_API_KEY" ]; then
    echo "⚠️  CLOUDFLARE_API_KEY: 設定済み（非推奨）"
else
    echo "✅ CLOUDFLARE_API_KEY: 未設定（推奨）"
fi

echo ""
echo "=== 推奨設定 ==="
echo "API Token方式を使用してください："
echo "export CLOUDFLARE_API_TOKEN=\"your-token-here\""
echo "export CLOUDFLARE_ACCOUNT_ID=\"your-account-id\""
