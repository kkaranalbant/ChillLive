# 🔍 Sorun Giderme Rehberi - Video Chat Uygulaması

**Güncelleme:** 2025-10-25
**Proje:** `/home/kaan/chat-app/`

---

## 📋 Hızlı Kontrol Listesi

Sorun yaşıyorsanız önce bunları kontrol edin:

```bash
# 1. MongoDB çalışıyor mu?
docker ps | grep mongodb

# 2. Backend çalışıyor mu?
curl http://localhost:5000/health

# 3. Kamera var mı?
ls /dev/video*

# 4. Portlar açık mı?
lsof -i:5000   # Backend
lsof -i:3001   # Frontend
```

---

## 🐛 Sık Karşılaşılan Sorunlar

### 1. MongoDB Bağlanamıyor

#### Hata:
```
❌ MongoDB connection failed: ECONNREFUSED ::1:27017
```

#### Sebep:
- MongoDB çalışmıyor
- Bağlantı string'i yanlış
- Docker container durmuş

#### Çözüm:

**Kontrol:**
```bash
docker ps -a | grep mongodb
```

**Container varsa başlat:**
```bash
docker start mongodb
```

**Container yoksa yeniden oluştur:**
```bash
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_DATABASE=chat-app mongo:7
```

**Logları kontrol et:**
```bash
docker logs mongodb
```

**Bağlantıyı test et:**
```bash
docker exec -it mongodb mongosh
```

---

### 2. Port Çakışması

#### Hata:
```
⚠ Port 3000 is in use by an unknown process
```

#### Çözüm:

**Port'u kullanan process'i bul:**
```bash
lsof -ti:3000
lsof -ti:3001
lsof -ti:5000
```

**Process'i kapat:**
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

**Alternatif:**
```bash
# Tüm node process'lerini kapat
pkill -f node

# Tüm Next.js process'lerini kapat
pkill -f next
```

---

### 3. Kamera Bulunamadı

#### Hata:
```
NotFoundError: Requested device not found
```

#### Sebep:
- Kamera BIOS'tan kapalı
- Fiziksel kamera yok
- Kamera başka uygulama kullanıyor

#### Çözüm:

**Kamera cihazını kontrol et:**
```bash
ls -la /dev/video*
```

**Beklenen çıktı:**
```
/dev/video0
/dev/video1
```

**Eğer boş gelirse:**

1. **BIOS'a gir:**
   - Bilgisayarı yeniden başlat
   - F2, F10, veya DEL tuşuna bas
   - "Integrated Camera" veya "Webcam" bul
   - Enable/Aktif yap
   - Kaydet ve çık

2. **Kernel modülünü kontrol et:**
```bash
lsmod | grep uvcvideo
```

3. **Modülü yükle (gerekirse):**
```bash
sudo modprobe uvcvideo
```

4. **Kamerayı test et:**
```bash
# v4l-utils yükle
sudo apt-get install v4l-utils

# Kamera bilgilerini görüntüle
v4l2-ctl --list-devices
```

---

### 4. Kamera İzni Reddedildi

#### Hata:
```
NotAllowedError: Permission denied
```

#### Çözüm:

**Chrome/Edge:**
1. Adres çubuğundaki kilit ikonuna tıkla
2. "Site ayarları"
3. Kamera ve Mikrofon → "İzin ver"
4. Sayfayı yenile (F5)

**Firefox:**
1. Adres çubuğundaki kilit ikonuna tıkla
2. İzinler
3. Kamera ve Mikrofon → "İzin ver"
4. Sayfayı yenile

**Kalıcı çözüm:**
```javascript
// Tarayıcı settings'den:
chrome://settings/content/camera
chrome://settings/content/microphone
```

---

### 5. WebRTC Bağlanamıyor

#### Hata:
```
Peer connection failed
ICE connection failed
```

#### Sebep:
- STUN/TURN server sorunu
- Firewall blokluyor
- NAT traversal problemi

#### Çözüm:

**STUN server'ı test et:**
```javascript
// Browser console'da:
const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});
console.log(pc.iceGatheringState);
```

**TURN server ekle:**
```typescript
// useWebRTC.ts
config: {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:YOUR_TURN_SERVER',
      username: 'user',
      credential: 'pass'
    }
  ]
}
```

**Firewall kontrol:**
```bash
# UDP portlarını kontrol et
sudo ufw status
sudo ufw allow 3478/udp
```

---

### 6. Socket Bağlanamıyor

#### Hata:
```
WebSocket connection failed
Socket disconnected
```

#### Çözüm:

**Backend çalışıyor mu:**
```bash
curl http://localhost:5000/health
```

**CORS hatası:**
```javascript
// backend/src/server.ts
cors: {
  origin: process.env.CORS_ORIGIN,
  credentials: true
}
```

**Socket bağlantısını test et:**
```javascript
// Browser console:
const socket = io('http://localhost:5000', {
  auth: { token: 'YOUR_TOKEN' }
});
socket.on('connect', () => console.log('Connected!'));
```

---

### 7. JWT Token Hatası

#### Hata:
```
401 Unauthorized
Invalid token
```

#### Çözüm:

**Token'ı kontrol et:**
```javascript
// Browser console:
localStorage.getItem('accessToken')
localStorage.getItem('refreshToken')
```

**Token'ı temizle ve yeniden giriş yap:**
```javascript
localStorage.clear()
// Sayfayı yenile ve tekrar giriş yap
```

**Backend secret kontrol:**
```bash
cat backend/.env | grep JWT_
```

---

### 8. Eşleşme Bulunamıyor

#### Hata:
```
Waiting for match...
Sırada 0 kişi var
```

#### Sebep:
- Başka kullanıcı yok
- Filter çok kısıtlayıcı
- Socket bağlantısı kopuk

#### Çözüm:

**İkinci kullanıcı aç:**
```
1. Farklı tarayıcıda aç (Firefox)
2. Veya incognito/private mode
3. Her ikisinde de "Eşleşmeye Başla"
```

**Filtreleri kaldır:**
```
Ayarlar → Filtreler → Hepsi
```

**Backend log kontrol:**
```bash
# Backend terminal'de:
User added to queue
Match found
```

---

### 9. Video Görünmüyor

#### Sebep:
- Stream başlamadı
- Track enable değil
- HTML video element hatası

#### Çözüm:

**Console loglarını kontrol et:**
```javascript
// Browser console (F12)
// "Received remote stream" mesajını ara
```

**Video element kontrol:**
```javascript
const video = document.querySelector('video');
console.log(video.srcObject);
console.log(video.srcObject.getTracks());
```

**Track'leri enable et:**
```javascript
localStream.getVideoTracks().forEach(t => {
  console.log('Video track:', t.enabled);
  t.enabled = true;
});
```

---

### 10. Mesaj Gitmiyor

#### Çözüm:

**Socket bağlantısını kontrol:**
```javascript
// Browser console:
socket.connected // true olmalı
```

**Room ID kontrol:**
```javascript
console.log(matchData?.roomId)
```

**Backend logs:**
```bash
# "chat-message" event'i görmeli
```

---

## 🔧 Debug Komutları

### Backend Debug

```bash
# Detaylı loglar
cd backend
DEBUG=* npm run dev

# MongoDB bağlantısını test et
docker exec -it mongodb mongosh
use chat-app
db.users.find()
db.reports.find()
```

### Frontend Debug

```javascript
// Browser console (F12)

// Socket durumu
console.log(socket.connected)
console.log(socket.id)

// Store durumu
console.log(useAuthStore.getState())
console.log(useChatStore.getState())

// WebRTC durumu
console.log(peer.connectionState)
console.log(peer.iceConnectionState)
```

### Network Debug

```bash
# Port dinleme
sudo netstat -tlnp | grep :5000
sudo netstat -tlnp | grep :3001

# Process'leri listele
ps aux | grep node
ps aux | grep next
```

---

## 🚨 Acil Durum Komutları

### Her Şeyi Temizle ve Baştan Başla

```bash
# 1. Tüm process'leri durdur
pkill -f node
pkill -f next
docker stop mongodb

# 2. Port'ları temizle
lsof -ti:3000,3001,5000 | xargs kill -9

# 3. Cache'i temizle
cd /home/kaan/chat-app/frontend
rm -rf .next node_modules/.cache

# 4. MongoDB'yi temizle (dikkat: veri kaybı!)
docker rm -f mongodb
docker run -d --name mongodb -p 27017:27017 mongo:7

# 5. Yeniden başlat
cd /home/kaan/chat-app
./start.sh
```

---

## 📊 Log Dosyaları

### Backend Logları
```bash
cd /home/kaan/chat-app/backend
# Terminal output
# Veya logları dosyaya kaydet:
npm run dev > logs/backend.log 2>&1
```

### Frontend Logları
```bash
# Browser console (F12)
# Network tab → Filter: WS (WebSocket)
```

### MongoDB Logları
```bash
docker logs mongodb
docker logs mongodb -f  # Canlı takip
```

---

## 🆘 Yardım Al

### 1. Claude Code ile Devam Et

```
Merhaba! Video chat uygulamamda sorun yaşıyorum.

Sorun: [sorunun detayı]
Hata mesajı: [tam hata mesajı]
Ne yaptım: [denediğin adımlar]

Proje konumu: /home/kaan/chat-app/
TROUBLESHOOTING.md dosyasını inceleyerek yardımcı olabilir misin?
```

### 2. Logları Topla

```bash
# Tüm logları topla
cd /home/kaan/chat-app

# Backend
cd backend && npm run dev > backend.log 2>&1 &

# Frontend
cd frontend && npm run dev > frontend.log 2>&1 &

# MongoDB
docker logs mongodb > mongodb.log 2>&1
```

### 3. Issue Aç

GitHub'da issue açarken şunları ekle:
- Hata mesajı
- Backend/Frontend logları
- Browser console screenshot
- Çalışma ortamı (OS, browser)

---

## ✅ Sorun Çözüldü mü?

Test checklist:

- [ ] MongoDB bağlantısı çalışıyor
- [ ] Backend health check OK (http://localhost:5000/health)
- [ ] Frontend açılıyor (http://localhost:3001)
- [ ] Giriş yapabiliyorum
- [ ] Socket bağlantısı kuruldu
- [ ] Kamera izni verildi
- [ ] Kendi kameramı görüyorum
- [ ] Eşleşme bulundu
- [ ] Partner'ın videosu görünüyor
- [ ] Mesajlaşma çalışıyor
- [ ] "Sonraki" butonu çalışıyor

---

**Son Güncelleme:** 2025-10-25
**Yardım:** SESSION-NOTES.md ve PROJECT-STATUS.md dosyalarına bakın
