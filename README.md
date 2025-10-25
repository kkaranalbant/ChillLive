# Chat App - Video Chat Uygulaması

WebRTC tabanlı rastgele eşleşme ve görüntülü sohbet uygulaması.

## 🚀 Hızlı Başlangıç

### 1. Database Kurulumu (MongoDB Atlas)

**Production için önerilen yöntem** - Güvenli, ücretsiz ve kolay:

1. https://cloud.mongodb.com adresine git ve ücretsiz hesap aç
2. M0 Free tier cluster oluştur
3. Database user oluştur (username + password)
4. Network Access → "Allow access from anywhere" (0.0.0.0/0)
5. Connection string'i kopyala
6. `backend/.env` dosyasını oluştur:
   ```bash
   cp backend/.env.example backend/.env
   ```
7. `MONGODB_URI` değişkenini güncelle:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/chat-app?retryWrites=true&w=majority
   ```

**Alternatif: Local MongoDB (Development only)**
```bash
# Docker ile MongoDB başlat
docker run -d --name mongodb -p 27017:27017 mongo:7
```

### 2. JWT Secret Oluştur

Güvenli JWT secret'ları üret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

İki kez çalıştır ve `.env` dosyasındaki `JWT_ACCESS_SECRET` ve `JWT_REFRESH_SECRET` değerlerini güncelle.

### 3. Tüm servisleri başlat:
```bash
./start.sh
```

Bu komut otomatik olarak şunları yapar:
1. ✅ MongoDB (Docker - opsiyonel)
2. ✅ Nginx reverse proxy başlatır (port 8080)
3. ✅ Backend server başlatır (port 5000)
4. ✅ Frontend server başlatır (port 3000)
5. ✅ Ngrok tunnel başlatır ve URL'i otomatik günceller

### Servisleri durdur:
```bash
./stop.sh
```

## 🔗 Ngrok URL Güncelleme

Ngrok yeniden başlatıldığında veya URL değiştiğinde:

```bash
./update-ngrok-url.sh
```

Bu script:
- ✅ Ngrok API'den yeni URL'i alır
- ✅ `backend/.env` → CORS_ORIGIN günceller
- ✅ `frontend/next.config.ts` → allowedDevOrigins günceller
- ✅ Servisler otomatik restart olur

## 📍 Linkler

- **Frontend (Yerel):** http://localhost:3000
- **Backend (Yerel):** http://localhost:5000
- **Nginx (Yerel):** http://localhost:8080
- **Ngrok UI:** http://localhost:4040
- **Ngrok Public URL:** Script çalıştırıldığında gösterilir

## 🛠️ Teknolojiler

### Backend:
- Node.js + Express
- Socket.io (WebRTC signaling)
- MongoDB Atlas (Cloud Database with Auth)
- JWT Authentication (bcrypt password hashing)
- TypeScript

### Frontend:
- Next.js 16 (Turbopack)
- React 19
- Socket.io Client
- SimplePeer (WebRTC)
- Zustand (State Management)

### Infrastructure:
- Nginx (Reverse Proxy)
- Ngrok (Public Tunnel)
- Docker (MongoDB)

## 📂 Proje Yapısı

```
chat-app/
├── backend/              # Backend API & Socket.io server
│   ├── src/
│   ├── .env
│   └── package.json
├── frontend/             # Next.js frontend
│   ├── src/
│   ├── next.config.ts
│   └── package.json
├── nginx.conf            # Nginx reverse proxy config
├── start.sh              # Tüm servisleri başlat
├── stop.sh               # Tüm servisleri durdur
├── update-ngrok-url.sh   # Ngrok URL güncelle
└── kaldigimyer           # Durum ve notlar
```

## 💡 İpuçları

1. **Kamera İzni:** İlk kullanımda tarayıcıya kamera/mikrofon izni vermeyi unutma
2. **BIOS Ayarı:** Bazı sistemlerde kamera BIOS'tan açılmalı
3. **Ngrok Free Plan:** URL her restart'ta değişir, bu yüzden `update-ngrok-url.sh` kullan
4. **Ngrok Static Domain:** Ücretli planda static domain alarak URL değişimini önleyebilirsin

## 🐛 Sorun Giderme

### Ngrok URL bulunamıyor:
```bash
# Ngrok çalışıyor mu kontrol et
curl http://localhost:4040/api/tunnels

# Manuel restart
pkill ngrok
ngrok http 8080 --log=stdout &
./update-ngrok-url.sh
```

### Backend/Frontend restart gerekiyorsa:
```bash
# Stop script ile durdur
./stop.sh

# Start script ile tekrar başlat
./start.sh
```

### Nginx config hatası:
```bash
# Test config
sudo nginx -t

# Config'i manuel kopyala
sudo cp nginx.conf /etc/nginx/sites-available/chat-app
sudo ln -sf /etc/nginx/sites-available/chat-app /etc/nginx/sites-enabled/chat-app
sudo systemctl reload nginx
```

## 🗄️ Veritabanı

### MongoDB Atlas (Production-ready)
✅ **Avantajları:**
- Ücretsiz 512MB (M0 tier)
- Otomatik authentication & encryption
- Otomatik backup
- Global replication
- 99.9% uptime SLA

### Database Schema:
**Users Collection:**
- Authentication (email, password hash)
- Profile (username, gender, age, location, bio)
- Preferences (gender filter, age range)
- Status tracking & ban system

**Reports Collection:**
- User reporting system
- Moderation tools

## 📝 Notlar

- **Database:** MongoDB Atlas (cloud) - güvenli ve production-ready
- **Auth:** JWT tokens + bcrypt password hashing
- Backend `tsx watch` ile hot-reload destekler
- Frontend Next.js ile otomatik restart yapar
- Nginx port 8080'de reverse proxy görevi görür
- Ngrok her restart'ta yeni URL verir (free plan)

## 🔐 Güvenlik

### Mevcut Güvenlik Özellikleri:
✅ MongoDB Atlas authentication (username + password)
✅ JWT token-based authentication
✅ Bcrypt password hashing (salt rounds: 10)
✅ CORS protection
✅ Rate limiting (900s window, 100 requests max)
✅ HTTPS (via Ngrok)
✅ Input validation (express-validator)

### Production Checklist:
1. ✅ `.env` dosyalarını git'e ekleme (.gitignore)
2. ✅ JWT secret'ları kriptografik olarak güvenli üret
3. ✅ MongoDB Atlas kullan (local MongoDB yerine)
4. ⚠️ CORS origin'leri production domain'e kısıtla
5. ⚠️ Rate limiting ayarlarını sıkılaştır
6. ⚠️ Nginx CSP headers ekle
7. ⚠️ MongoDB Atlas Network Access'i IP whitelist ile kısıtla

---

**Geliştirici:** Kaan
**Son Güncelleme:** 2025-10-25
