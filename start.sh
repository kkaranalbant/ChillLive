#!/bin/bash

echo "🚀 Chat App Başlatılıyor..."
echo ""

# MongoDB kontrolü
echo "1️⃣ MongoDB kontrol ediliyor..."
if ! docker ps | grep -q mongodb; then
    echo "   MongoDB başlatılıyor..."
    docker start mongodb 2>/dev/null || docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_DATABASE=chat-app mongo:7
    echo "   ✅ MongoDB başlatıldı"
else
    echo "   ✅ MongoDB zaten çalışıyor"
fi

echo ""
echo "2️⃣ Nginx kontrol ediliyor..."

# Nginx config'i kopyala
if [ -f "/home/kaan/chat-app/nginx.conf" ]; then
    sudo cp /home/kaan/chat-app/nginx.conf /etc/nginx/sites-available/chat-app
    sudo ln -sf /etc/nginx/sites-available/chat-app /etc/nginx/sites-enabled/chat-app
    
    # Nginx config test
    if sudo nginx -t 2>&1 | grep -q "successful"; then
        echo "   ✅ Nginx config güncellendi"
    else
        echo "   ❌ Nginx config hatası!"
        exit 1
    fi
else
    echo "   ⚠️  nginx.conf bulunamadı"
fi

# Nginx başlat veya restart
if systemctl is-active --quiet nginx; then
    echo "   🔄 Nginx restart ediliyor..."
    sudo systemctl reload nginx
    echo "   ✅ Nginx restart edildi"
else
    echo "   🔧 Nginx başlatılıyor..."
    sudo systemctl start nginx
    echo "   ✅ Nginx başlatıldı"
fi

echo ""
echo "3️⃣ Backend başlatılıyor..."
echo "   Terminal 1: Backend (http://localhost:5000)"

# Backend için yeni terminal aç
konsole --new-tab -p tabtitle="Backend" -e bash -c "cd /home/kaan/chat-app/backend && npm run dev; exec bash" &

sleep 3

echo ""
echo "4️⃣ Frontend başlatılıyor..."
echo "   Terminal 2: Frontend (http://localhost:3000)"

# Frontend için yeni terminal aç
konsole --new-tab -p tabtitle="Frontend" -e bash -c "cd /home/kaan/chat-app/frontend && npm run dev; exec bash" &

sleep 5

echo ""
echo "5️⃣ Ngrok başlatılıyor..."

# Ngrok için yeni terminal aç
konsole --new-tab -p tabtitle="Ngrok" -e bash -c "ngrok http 8080 --log=stdout; exec bash" &

# Ngrok'un başlamasını bekle
sleep 5

# Ngrok URL'i otomatik güncelle
if curl -s http://localhost:4040/api/tunnels > /dev/null 2>&1; then
    echo "   🔄 Ngrok URL güncelleniyor..."
    /home/kaan/chat-app/update-ngrok-url.sh
else
    echo "   ⚠️  Ngrok başlatılamadı, manuel olarak URL güncelle:"
    echo "      ./update-ngrok-url.sh"
fi

echo ""
echo "✅ Tüm servisler başlatıldı!"
echo ""
echo "📍 Linkler:"
echo "   - Frontend:  http://localhost:3000"
echo "   - Backend:   http://localhost:5000"
echo "   - Nginx:     http://localhost:8080"
echo "   - Ngrok UI:  http://localhost:4040"
echo ""
echo "💡 İpucu:"
echo "   - Ngrok URL değişirse: ./update-ngrok-url.sh"
echo "   - Servisleri durdurmak için: ./stop.sh"
echo ""
