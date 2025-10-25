#!/bin/bash

echo "🔄 Ngrok URL güncelleniyor..."
echo ""

# Ngrok API'den URL al (ngrok version 3 için)
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[a-zA-Z0-9.-]*\.ngrok-free\.app' | head -1)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Ngrok URL bulunamadı!"
    echo "   Ngrok çalışıyor mu kontrol et: curl http://localhost:4040/api/tunnels"
    exit 1
fi

echo "✅ Yeni Ngrok URL: $NGROK_URL"
echo ""

# Backend .env dosyasını güncelle
BACKEND_ENV="/home/kaan/chat-app/backend/.env"
if [ -f "$BACKEND_ENV" ]; then
    echo "📝 Backend .env güncelleniyor..."
    # Mevcut CORS_ORIGIN satırını bul ve değiştir
    sed -i "s|CORS_ORIGIN=.*|CORS_ORIGIN=http://localhost:3000,http://localhost:8080,$NGROK_URL|g" "$BACKEND_ENV"
    echo "   ✅ Backend .env güncellendi"
else
    echo "   ⚠️  Backend .env bulunamadı"
fi

echo ""

# Frontend next.config.ts dosyasını güncelle
FRONTEND_CONFIG="/home/kaan/chat-app/frontend/next.config.ts"
if [ -f "$FRONTEND_CONFIG" ]; then
    echo "📝 Frontend config güncelleniyor..."
    # Domain'i ngrok URL'den çıkar (https:// kısmını at)
    NGROK_DOMAIN=$(echo $NGROK_URL | sed 's|https://||')
    
    # allowedDevOrigins satırını güncelle
    sed -i "s|allowedDevOrigins: \['[^']*'\]|allowedDevOrigins: ['$NGROK_DOMAIN']|g" "$FRONTEND_CONFIG"
    echo "   ✅ Frontend config güncellendi"
else
    echo "   ⚠️  Frontend config bulunamadı"
fi

echo ""
echo "🎉 URL güncelleme tamamlandı!"
echo ""
echo "📌 Yeni URL: $NGROK_URL"
echo ""
echo "⚠️  Not: Backend ve Frontend otomatik restart olacak (tsx watch & Next.js)"
echo "   Manuel restart gerekirse:"
echo "   - Backend: Ctrl+C ve npm run dev"
echo "   - Frontend: Otomatik restart edilir"
echo ""
