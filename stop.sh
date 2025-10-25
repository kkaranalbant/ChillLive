#!/bin/bash

echo "🛑 Chat App servisleri durduruluyor..."
echo ""

# Ngrok'u durdur
echo "1️⃣ Ngrok durduruluyor..."
pkill -f "ngrok http" && echo "   ✅ Ngrok durduruldu" || echo "   ⚠️  Ngrok zaten durdurulmuş"

echo ""
echo "2️⃣ Nginx durduruluyor..."
if systemctl is-active --quiet nginx; then
    sudo systemctl stop nginx
    echo "   ✅ Nginx durduruldu"
else
    echo "   ⚠️  Nginx zaten durdurulmuş"
fi

echo ""
echo "3️⃣ Backend & Frontend durduruluyor..."
# Node.js process'lerini bul ve durdur (tsx watch ve next dev)
BACKEND_PID=$(pgrep -f "tsx watch src/server.ts")
FRONTEND_PID=$(pgrep -f "next dev")

if [ -n "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null
    echo "   ✅ Backend durduruldu (PID: $BACKEND_PID)"
else
    echo "   ⚠️  Backend process bulunamadı"
fi

if [ -n "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null
    echo "   ✅ Frontend durduruldu (PID: $FRONTEND_PID)"
else
    echo "   ⚠️  Frontend process bulunamadı"
fi

echo ""
echo "4️⃣ MongoDB durduruluyor..."
read -p "   MongoDB'yi de durdurmak istiyor musun? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker stop mongodb && echo "   ✅ MongoDB durduruldu" || echo "   ⚠️  MongoDB zaten durdurulmuş"
else
    echo "   ⏩ MongoDB çalışmaya devam ediyor"
fi

echo ""
echo "✅ Servisler durduruldu!"
echo ""
echo "💡 Yeniden başlatmak için: ./start.sh"
echo ""
