# ChillLive - Teknik Dokümantasyon ve Öğrenim Rehberi

Bu dokümantasyon, ChillLive projesinin geliştirilme sürecini, kullanılan teknolojileri ve karşılaşılan sorunların çözümlerini detaylı olarak açıklar.

---

## 📚 İçindekiler

1. [Proje Genel Bakış](#proje-genel-bakış)
2. [Kullanılan Teknolojiler](#kullanılan-teknolojiler)
3. [Mimari Yapı](#mimari-yapı)
4. [Geliştirme Süreci](#geliştirme-süreci)
5. [Karşılaşılan Sorunlar ve Çözümler](#karşılaşılan-sorunlar-ve-çözümler)
6. [WebRTC Nasıl Çalışır?](#webrtc-nasıl-çalışır)
7. [Production Deployment](#production-deployment)
8. [Performans ve Optimizasyon](#performans-ve-optimizasyon)

---

## Proje Genel Bakış

**ChillLive**, rastgele eşleşen kullanıcılar arasında gerçek zamanlı görüntülü sohbet sağlayan bir web uygulamasıdır. Omegle benzeri bir platformdur.

### Temel Özellikler:
- ✅ Rastgele kullanıcı eşleştirme
- ✅ Peer-to-peer video chat (WebRTC)
- ✅ Gerçek zamanlı mesajlaşma
- ✅ Kullanıcı kimlik doğrulama (JWT)
- ✅ Guest (misafir) giriş desteği
- ✅ Kullanıcı tercihleri (cinsiyet, yaş filtreleme)
- ✅ Raporlama sistemi
- ✅ Responsive tasarım (mobil + desktop)

---

## Kullanılan Teknolojiler

### Frontend

#### 1. **Next.js 16 (React 19)**
- **Ne İşe Yarar?** Modern web uygulamaları için React framework'ü
- **Neden Kullandık?**
  - Server-side rendering (SEO için)
  - Otomatik code splitting (performans)
  - Built-in routing
  - Turbopack (hızlı development build)

```javascript
// Next.js App Router yapısı
app/
  page.tsx          // Ana sayfa
  chat/
    page.tsx        // Chat sayfası
  layout.tsx        // Global layout
```

#### 2. **TypeScript**
- **Ne İşe Yarar?** JavaScript'e tip güvenliği ekler
- **Avantajları:**
  - Compile-time hata yakalama
  - IDE autocomplete desteği
  - Kod okunabilirliği

```typescript
// Örnek: Tip tanımları
interface User {
  _id: string;
  username: string;
  isGuest: boolean;
  preferences: {
    genderFilter: 'male' | 'female' | 'all';
    ageRange: { min: number; max: number };
  };
}
```

#### 3. **Socket.io Client**
- **Ne İşe Yarar?** Gerçek zamanlı çift yönlü iletişim
- **Kullanım Alanları:**
  - Kullanıcı eşleştirme
  - WebRTC signaling
  - Chat mesajları
  - Durum güncellemeleri

```javascript
// Socket.io event'leri
socket.on('match-found', (data) => {
  // Eşleşme bulundu, WebRTC başlat
});

socket.emit('find-match', preferences);
```

#### 4. **SimplePeer (WebRTC)**
- **Ne İşe Yarar?** WebRTC için kolaylaştırıcı kütüphane
- **Neden WebRTC?**
  - Peer-to-peer video/audio iletişimi
  - Düşük latency (gecikme)
  - Sunucu yükü yok (P2P)

```javascript
const peer = new SimplePeer({
  initiator: true,  // Bağlantıyı başlatan
  stream: localStream,  // Kendi kamera/mikrofon
  config: {
    iceServers: [/* STUN/TURN servers */]
  }
});
```

#### 5. **Zustand**
- **Ne İşe Yarar?** Global state management
- **Redux'a Göre Avantajları:**
  - Daha az boilerplate kod
  - Daha kolay kullanım
  - TypeScript desteği

```javascript
// Store tanımı
const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

#### 6. **Tailwind CSS 4**
- **Ne İşe Yarar?** Utility-first CSS framework
- **Avantajları:**
  - Hızlı styling
  - Responsive tasarım kolaylığı
  - Küçük bundle size (kullanılmayan classlar silinir)

```jsx
<button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg">
  Hızlı Başla
</button>
```

---

### Backend

#### 1. **Node.js + Express**
- **Ne İşe Yarar?** REST API sunucusu
- **Endpoint Örnekleri:**
  - `POST /api/auth/register` - Kullanıcı kaydı
  - `POST /api/auth/login` - Giriş
  - `POST /api/auth/guest` - Misafir giriş
  - `GET /api/users/profile` - Profil bilgisi

```javascript
app.post('/api/auth/guest', async (req, res) => {
  const guestUser = await User.create({
    username: `Guest_${Date.now()}`,
    isGuest: true
  });

  const token = generateJWT({ userId: guestUser._id });
  res.json({ user: guestUser, token });
});
```

#### 2. **Socket.io Server**
- **Ne İşe Yarar?** Gerçek zamanlı event yönetimi
- **Event Flow:**

```
Client 1              Server              Client 2
   |                    |                    |
   |--- find-match ---->|                    |
   |                    |<--- find-match ----|
   |                    |                    |
   |<-- match-found ----|--- match-found --->|
   |                    |                    |
   |--- signal -------->|--- signal -------->|
   |<--- signal --------|<--- signal --------|
```

#### 3. **MongoDB + Mongoose**
- **Ne İşe Yarar?** NoSQL veritabanı
- **Schema Örnekleri:**

```javascript
const UserSchema = new Schema({
  username: { type: String, required: true },
  email: String,
  password: String,  // bcrypt hash
  isGuest: { type: Boolean, default: false },
  preferences: {
    genderFilter: {
      type: String,
      enum: ['male', 'female', 'all'],
      default: 'all'
    },
    ageRange: {
      min: { type: Number, default: 18 },
      max: { type: Number, default: 99 }
    }
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'in-chat'],
    default: 'offline'
  }
});
```

#### 4. **JWT (JSON Web Tokens)**
- **Ne İşe Yarar?** Stateless authentication
- **Nasıl Çalışır?**

```
1. Kullanıcı giriş yapar
2. Server JWT oluşturur (userId + secret ile imzalar)
3. Client JWT'yi kaydeder (localStorage)
4. Her request'te JWT gönderilir
5. Server JWT'yi doğrular
```

```javascript
// JWT oluşturma
const token = jwt.sign(
  { userId: user._id, isGuest: false },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);

// JWT doğrulama
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

#### 5. **Bcrypt**
- **Ne İşe Yarar?** Şifre hashleme
- **Neden Gerekli?** Veritabanında şifreleri plain text saklamamak için

```javascript
// Şifre hashleme
const hashedPassword = await bcrypt.hash(password, 10);

// Şifre karşılaştırma
const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
```

---

### Infrastructure & Deployment

#### 1. **Vercel (Frontend Hosting)**
- **Ne İşe Yarar?** Next.js uygulamaları için optimize edilmiş hosting
- **Avantajları:**
  - Otomatik SSL (HTTPS)
  - Global CDN (hızlı erişim)
  - Git push ile otomatik deploy
  - Serverless functions

#### 2. **Render (Backend Hosting)**
- **Ne İşe Yarar?** Node.js uygulamaları için PaaS
- **Avantajları:**
  - Ücretsiz tier
  - Otomatik HTTPS
  - WebSocket desteği
  - Docker desteği

**⚠️ Render Free Tier Sınırlaması:**
- 15 dakika inaktif kalınca "uyur" (spin down)
- İlk request 30-60 saniye sürebilir (cold start)
- Çözüm: Paid plan ($7/ay) veya cron job ile ping

#### 3. **MongoDB Atlas**
- **Ne İşe Yarar?** Cloud MongoDB servisi
- **Avantajları:**
  - Ücretsiz 512MB (M0 tier)
  - Otomatik backup
  - Global replication
  - 99.9% uptime

#### 4. **GitHub**
- **Ne İşe Yarar?** Version control + CI/CD
- **Deployment Flow:**

```
git push origin main
     ↓
GitHub webhook
     ↓
├─> Vercel (frontend) → Build → Deploy
└─> Render (backend)  → Build → Deploy
```

---

## Mimari Yapı

### Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
├─────────────────────────────────────────────────────────┤
│  Next.js App                                             │
│  ├─ React Components                                     │
│  ├─ Zustand Stores (State)                              │
│  ├─ Socket.io Client ────────┐                          │
│  └─ SimplePeer (WebRTC) ─┐   │                          │
└───────────────────────────┼───┼──────────────────────────┘
                            │   │
                    ┌───────┘   └────────┐
                    │                    │
            WebRTC P2P Connection   Socket.io
            (Video/Audio)           (Signaling)
                    │                    │
                    │   ┌────────────────┘
                    │   │
┌───────────────────┼───┼──────────────────────────────────┐
│                   │   ↓                                   │
│              SERVER (Render)                              │
├───────────────────────────────────────────────────────────┤
│  Express.js API                                           │
│  ├─ REST Endpoints (Auth, Users, Reports)                │
│  ├─ Socket.io Server (Matching, Signaling)               │
│  ├─ JWT Middleware                                        │
│  └─ CORS Configuration                                    │
│                   │                                       │
│                   ↓                                       │
│         MongoDB Atlas (Database)                          │
│         ├─ Users Collection                               │
│         └─ Reports Collection                             │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│           TURN Server (Metered.ca)                        │
│   NAT Traversal için relay (mobil bağlantılar)           │
└───────────────────────────────────────────────────────────┘
```

### Data Flow: Kullanıcı Eşleştirme

```
[User A]                [Server]                [User B]
   │                        │                        │
   │──find-match────────────>│                        │
   │   (preferences)         │                        │
   │                         │<───find-match──────────│
   │                         │   (preferences)        │
   │                         │                        │
   │                    [Matching Logic]               │
   │                    - Check filters                │
   │                    - Create room                  │
   │                         │                        │
   │<──match-found───────────│──match-found──────────>│
   │   (roomId, partnerId)   │   (roomId, partnerId)  │
   │                         │                        │
   │                    [WebRTC Begins]                │
   │                         │                        │
```

### Data Flow: WebRTC Bağlantı Kurulumu

```
[Initiator]             [Server]             [Receiver]
     │                     │                      │
     │                     │                      │
     ├─ Create Peer ───────┤                      │
     │  (initiator=true)   │                      │
     │                     │                      │
     │──'signal' (offer)───>│──'signal' (offer)──>│
     │                     │                      │
     │                     │                ├─ Create Peer
     │                     │                │  (initiator=false)
     │                     │                │
     │                     │                │─ peer.signal(offer)
     │                     │                │
     │<──'signal' (answer)─│<──'signal'─────│
     │                     │   (answer)     │
     │                     │                │
     │─ peer.signal(answer)│                │
     │                     │                │
     │<──'signal'──────────│<──'signal'─────│
     │  (candidate)        │  (candidate)   │
     │──'signal'───────────>│──'signal'─────>│
     │  (candidate)        │  (candidate)   │
     │                     │                │
     │◄═════════════════════════════════════►│
     │         P2P Connection Established     │
     │         (Direct Video/Audio Stream)    │
     │                     │                │
```

---

## Geliştirme Süreci

### Faz 1: Development Environment (Localhost)

**Başlangıç Yapısı:**
```
MongoDB (Docker) ←─── Backend (localhost:5000)
                         ↑
                         │
                   Nginx (localhost:8080)
                         ↑
                         │
                   Frontend (localhost:3000)
                         ↑
                         │
                   Ngrok (Public URL)
```

**Neden Ngrok?**
- WebRTC için HTTPS gerekli
- Mobil cihazlardan test için public URL gerekli
- Ngrok ücretsiz HTTPS tunnel sağlıyor

**Otomasyon Scriptleri:**
- `start.sh` - Tüm servisleri başlat
- `stop.sh` - Tüm servisleri durdur
- `update-ngrok-url.sh` - Ngrok URL değişince config'leri güncelle

### Faz 2: Production Deployment

**Hedef Yapısı:**
```
MongoDB Atlas (Cloud) ←─── Backend (Render)
                              ↑
                              │
                         Frontend (Vercel)
```

**Deployment Checklist:**
1. ✅ MongoDB Atlas hesabı oluştur
2. ✅ GitHub repository oluştur
3. ✅ Backend'i Render'a deploy et
4. ✅ Frontend'i Vercel'e deploy et
5. ✅ Environment variables ayarla
6. ✅ CORS ayarlarını güncelle
7. ✅ TURN server ekle

---

## Karşılaşılan Sorunlar ve Çözümler

### 🔴 Sorun 1: WebRTC Signal Listeners Cleanup Sorunu

**Belirti:**
- "WebRTC Setup" logu iki kez yazılıyor
- Signal exchange olmuyor
- Kullanıcılar birbirini göremiyordu

**Sebep:**
```javascript
// YANLIŞ ❌
useEffect(() => {
  socketService.onSignal((data) => {
    // Her render'da yeni listener ekleniyordu
  });
  // Cleanup yok!
}, [matchData]);
```

**Çözüm:**
```javascript
// DOĞRU ✅
useEffect(() => {
  // Named function for cleanup
  const handleSignal = (data) => {
    if (peer && !peer.destroyed) {
      peer.signal(data);
    }
  };

  socketService.onSignal(handleSignal);

  // Cleanup
  return () => {
    socketService.off('signal', handleSignal);
  };
}, [matchData]);
```

**Öğrenilen:**
- React useEffect cleanup çok önemli
- Event listener'lar her render'da eklenmemeli
- Named function kullanarak cleanup yapılabilir

---

### 🔴 Sorun 2: Nginx 404 Hatası

**Belirti:**
- `/api/auth/guest` endpoint'i 404 döndürüyordu
- Frontend API'ye ulaşamıyordu

**Sebep:**
```nginx
# YANLIŞ ❌
location /api/ {
    proxy_pass http://backend/;  # Trailing slash!
}
```

Bu config ile:
- Request: `/api/auth/guest`
- Backend'e giden: `/auth/guest` (api prefix silindi!)

**Çözüm:**
```nginx
# DOĞRU ✅
location /api/ {
    proxy_pass http://backend;  # No trailing slash
}
```

**Öğrenilen:**
- Nginx `proxy_pass` sonundaki `/` çok önemli
- Trailing slash varsa path rewrite eder
- Trailing slash yoksa path'i olduğu gibi iletir

---

### 🔴 Sorun 3: TypeScript Build Hataları

**Belirti:**
- Production build başarısız
- `user._id` type hatası
- `SignalData` type hatası

**Sebep:**
```typescript
// YANLIŞ ❌
const token = generateToken({
  userId: user._id.toString()  // user._id type 'unknown'
});
```

**Çözüm:**
```typescript
// DOĞRU ✅
const token = generateToken({
  userId: String(user._id)  // Explicit cast
});

// veya
const token = generateToken({
  userId: user._id as string
});
```

**Öğrenilen:**
- TypeScript strict mode production build'de daha sıkı
- Development'ta geçen kodlar production'da fail olabilir
- Type casting gerektiğinde `as` veya `String()` kullan

---

### 🔴 Sorun 4: CORS Policy Hatası

**Belirti:**
```
Access-Control-Allow-Origin does not match 'chill-live.vercel.app'
```

**Sebep 1 - HTTPS Eksik:**
```javascript
// Backend .env
CORS_ORIGIN=chill-live.vercel.app  // ❌ HTTPS yok
```

**Sebep 2 - Multiple Origin Parsing:**
```javascript
// YANLIŞ ❌
app.use(cors({
  origin: process.env.CORS_ORIGIN  // String: "url1,url2,url3"
}));
```

CORS middleware virgülle ayrılmış string'i parse etmiyor!

**Çözüm:**
```javascript
// DOĞRU ✅
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: corsOrigins  // Array: ["url1", "url2", "url3"]
}));
```

**Öğrenilen:**
- CORS origin'de protocol (https://) şart
- Multiple origin için array gerekli
- Environment variable'lar her zaman string

---

### 🔴 Sorun 5: Render Port Binding Hatası

**Belirti:**
- Backend "port 10000" diyor
- Ama service erişilemiyor

**Sebep:**
```javascript
const PORT = 5000;  // ❌ Hardcoded
```

**Render Nasıl Çalışır:**
- Render otomatik PORT environment variable set eder
- Service bu porta bind olmalı
- External olarak Render kendi routing yapar

**Çözüm:**
```javascript
// DOĞRU ✅
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Öğrenilen:**
- Cloud platformlar PORT variable set eder
- Port'u hardcode etme
- Internal port farklı olabilir (10000 vs 443)

---

### 🔴 Sorun 6: Telefon-Telefon WebRTC Bağlanamıyor

**Belirti:**
- Bilgisayar ↔ Telefon: ✅ Çalışıyor
- Telefon ↔ Telefon: ❌ "Bağlanıyor..." kalıyor

**Sebep:**
Mobil networkler (4G/5G) **Symmetric NAT** kullanıyor:

```
[Phone A (4G)]     Internet     [Phone B (4G)]
     NAT  ←─────────X─────────→  NAT
     │                            │
     └──────── BLOCKED ────────────┘
```

**STUN vs TURN:**

```
STUN (Session Traversal Utilities for NAT):
- Public IP discovery
- Basit NAT'lar için yeterli
- Ücretsiz (Google STUN)

TURN (Traversal Using Relays around NAT):
- Relay server üzerinden trafik
- Karmaşık NAT'lar için gerekli
- Ücretli (bandwidth kullanır)
```

**Çözüm:**
```javascript
// Önceki (sadece STUN) ❌
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' }
]

// Sonraki (STUN + TURN) ✅
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: 'turn:a.relay.metered.ca:80',
    username: 'xxx',
    credential: 'yyy'
  },
  {
    urls: 'turn:a.relay.metered.ca:443',
    username: 'xxx',
    credential: 'yyy'
  }
]
```

**ICE Candidate Gathering:**
```
WebRTC ICE (Interactive Connectivity Establishment):

1. Host Candidate (Direct)
   └─> Aynı ağdaysa direkt bağlan

2. Server Reflexive (STUN)
   └─> Public IP discovery, farklı ağlardan bağlan

3. Relay Candidate (TURN)
   └─> TURN server üzerinden relay
```

**Öğrenilen:**
- Mobil networkler P2P bağlantıyı zorlaştırır
- STUN her zaman yeterli değil
- Production'da mutlaka TURN gerekli
- Metered.ca ücretsiz 50GB/ay TURN sağlıyor

---

## WebRTC Nasıl Çalışır?

### WebRTC Temel Kavramlar

#### 1. **Peer Connection**
İki tarayıcı arasındaki direkt bağlantı.

```javascript
const peer = new RTCPeerConnection({
  iceServers: [/* STUN/TURN servers */]
});
```

#### 2. **Media Stream**
Kamera/mikrofon akışı.

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});
```

#### 3. **Signaling**
İki peer arasında bağlantı bilgilerinin değişimi (Socket.io ile).

```
Peer A                 Signal Server                 Peer B
  │                          │                          │
  │────── Offer ────────────>│────── Offer ────────────>│
  │                          │                          │
  │<───── Answer ────────────│<───── Answer ────────────│
  │                          │                          │
  │──── ICE Candidate ──────>│──── ICE Candidate ──────>│
  │<──── ICE Candidate ──────│<──── ICE Candidate ──────│
  │                          │                          │
  │◄══════════════════════════════════════════════════►│
  │                  Direct P2P Stream                  │
```

#### 4. **SDP (Session Description Protocol)**
Bağlantı parametrelerini açıklayan format.

```javascript
// Offer SDP
{
  type: 'offer',
  sdp: 'v=0\no=- 123... (codec info, media types, etc.)'
}

// Answer SDP
{
  type: 'answer',
  sdp: 'v=0\no=- 456...'
}
```

#### 5. **ICE Candidates**
Bağlantı için olası network yolları.

```javascript
{
  candidate: 'candidate:1 1 UDP 2130706431 192.168.1.5 54321 typ host',
  sdpMLineIndex: 0
}
```

### WebRTC Connection Flow (Detaylı)

```
┌──────────────────────────────────────────────────────────────┐
│ PHASE 1: Media Access                                         │
└──────────────────────────────────────────────────────────────┘
Peer A:
  getUserMedia() → Camera/Mic permission → Local Stream

Peer B:
  getUserMedia() → Camera/Mic permission → Local Stream

┌──────────────────────────────────────────────────────────────┐
│ PHASE 2: Peer Connection Creation                            │
└──────────────────────────────────────────────────────────────┘
Peer A (Initiator):
  new RTCPeerConnection()
  peer.addStream(localStream)
  peer.createOffer() → SDP Offer

Peer B:
  (waits for offer)

┌──────────────────────────────────────────────────────────────┐
│ PHASE 3: Signaling Exchange                                  │
└──────────────────────────────────────────────────────────────┘
Peer A → Server → Peer B: Offer
  {
    type: 'offer',
    sdp: '...'  // Supported codecs, media types
  }

Peer B:
  new RTCPeerConnection()
  peer.addStream(localStream)
  peer.setRemoteDescription(offer)
  peer.createAnswer() → SDP Answer

Peer B → Server → Peer A: Answer
  {
    type: 'answer',
    sdp: '...'
  }

Peer A:
  peer.setRemoteDescription(answer)

┌──────────────────────────────────────────────────────────────┐
│ PHASE 4: ICE Candidate Exchange                              │
└──────────────────────────────────────────────────────────────┘
Both Peers:
  - Gather ICE candidates (host, srflx, relay)
  - Send each candidate to other peer
  - Add received candidates: peer.addIceCandidate()

Example Candidates:
  - Host:    192.168.1.5:54321 (local IP)
  - Srflx:   203.0.113.45:12345 (public IP via STUN)
  - Relay:   turn-server:3478 (via TURN)

┌──────────────────────────────────────────────────────────────┐
│ PHASE 5: Connection Establishment                            │
└──────────────────────────────────────────────────────────────┘
ICE attempts connection via candidates:
  1. Try direct (host to host)
  2. Try via STUN (public IPs)
  3. Fallback to TURN (relay)

First successful path → Connection established!

┌──────────────────────────────────────────────────────────────┐
│ PHASE 6: Media Streaming                                     │
└──────────────────────────────────────────────────────────────┘
Peer A ◄════════════════════════════════════► Peer B
       Direct encrypted media stream
       (SRTP - Secure Real-time Transport Protocol)
```

---

## Production Deployment

### Deployment Checklist

#### 1. **Git Repository Hazırlığı**

```bash
# .gitignore kontrolü
cat .gitignore
# Şunlar olmalı:
# - .env
# - node_modules/
# - dist/
# - .next/

# GitHub'a push
git add .
git commit -m "Initial commit"
git push origin main
```

#### 2. **MongoDB Atlas Kurulumu**

```
1. https://cloud.mongodb.com → Sign up
2. Create Cluster (M0 Free)
3. Database Access:
   - Username: myapp_user
   - Password: [Strong Password]
4. Network Access:
   - IP Whitelist: 0.0.0.0/0 (Allow from anywhere)
   - (Production'da Render IP'lerini ekle)
5. Get Connection String:
   mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

#### 3. **Backend Deployment (Render)**

**Adım 1: Service Oluştur**
```
1. https://render.com → New → Web Service
2. Connect GitHub repository
3. Settings:
   - Name: chilllive-backend
   - Region: Frankfurt (EU Central)
   - Branch: main
   - Root Directory: backend
   - Runtime: Node
   - Build Command: npm install --include=dev && npm run build
   - Start Command: npm start
   - Instance Type: Free
```

**Adım 2: Environment Variables**
```bash
NODE_ENV=production
PORT=10000

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/chat-app

# JWT Secrets (Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_ACCESS_SECRET=your-256-bit-secret
JWT_REFRESH_SECRET=your-256-bit-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS (Vercel URL'i deploy sonrası eklenecek)
CORS_ORIGIN=https://your-app.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Adım 3: Deploy**
```
Manual Deploy → Deploy latest commit
```

**Adım 4: Test**
```bash
curl https://your-backend.onrender.com/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

#### 4. **Frontend Deployment (Vercel)**

**Adım 1: Import Project**
```
1. https://vercel.com → New Project
2. Import Git Repository
3. Configure:
   - Framework: Next.js (auto-detected)
   - Root Directory: frontend
   - Build Command: npm run build (auto)
   - Output Directory: .next (auto)
```

**Adım 2: Environment Variables**
```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
```

**Adım 3: Deploy**
```
Deploy → Wait for build
```

**Adım 4: Backend CORS Güncelle**
```
Render → Environment → CORS_ORIGIN
Değer: https://your-app.vercel.app
Save → Auto redeploy
```

### Post-Deployment Tasks

#### 1. **Test Tüm Özellikleri**
```
✅ Guest login
✅ User registration
✅ User login
✅ Match finding
✅ Video connection (desktop-desktop)
✅ Video connection (mobile-mobile)
✅ Chat messaging
✅ Skip partner
✅ Report system
```

#### 2. **Performans Monitoring**

**Render Logs:**
```bash
# Render Dashboard → Logs
# Kontrol et:
- MongoDB bağlantı hataları
- Socket.io bağlantı sayısı
- Hata mesajları
```

**Vercel Analytics:**
```bash
# Vercel Dashboard → Analytics
# Kontrol et:
- Page load time
- API response time
- Error rate
```

#### 3. **Database Monitoring**

**MongoDB Atlas:**
```bash
# Atlas Dashboard → Metrics
# Kontrol et:
- Connection count
- Operations per second
- Storage usage
- Network usage
```

---

## Performans ve Optimizasyon

### Frontend Optimizasyonları

#### 1. **Code Splitting**
Next.js otomatik olarak route bazında split eder:

```javascript
// app/chat/page.tsx sadece /chat'te yüklenir
// app/page.tsx sadece home'da yüklenir
```

#### 2. **Image Optimization**
```jsx
import Image from 'next/image';

<Image
  src="/avatar.jpg"
  width={100}
  height={100}
  alt="Avatar"
  priority  // LCP için
/>
```

#### 3. **Lazy Loading**
```javascript
// Component'i lazy load
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>
});
```

### Backend Optimizasyonları

#### 1. **Database Indexing**
```javascript
// Sık sorgulanan field'lere index
UserSchema.index({ email: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ 'preferences.genderFilter': 1 });
```

#### 2. **Connection Pooling**
```javascript
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,  // Maksimum 10 connection
  minPoolSize: 2,   // Minimum 2 connection
  socketTimeoutMS: 45000,
});
```

#### 3. **Rate Limiting**
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 dakika
  max: 100,  // Max 100 request
  message: 'Too many requests'
});

app.use('/api/', limiter);
```

### WebRTC Optimizasyonları

#### 1. **Video Constraints**
```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30, max: 30 }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true
  }
});
```

#### 2. **Bandwidth Adaptation**
```javascript
// SimplePeer otomatik bandwidth adaptation yapar
// Ağ yavaşsa video kalitesini düşürür
```

---

## Güvenlik

### İmplementasyonlar

#### 1. **JWT Authentication**
```javascript
// Token expiry
accessToken: 15 dakika
refreshToken: 7 gün

// Secure headers
httpOnly: true (cookies için)
secure: true (HTTPS)
```

#### 2. **Password Hashing**
```javascript
// Bcrypt salt rounds
const saltRounds = 10;
const hash = await bcrypt.hash(password, saltRounds);
```

#### 3. **CORS Protection**
```javascript
// Sadece belirtilen domain'lerden istek kabul et
cors({
  origin: ['https://your-app.vercel.app'],
  credentials: true
})
```

#### 4. **Rate Limiting**
```javascript
// DDoS koruması
rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})
```

#### 5. **Input Validation**
```javascript
// express-validator ile
body('email').isEmail(),
body('password').isLength({ min: 6 })
```

#### 6. **MongoDB Injection Prevention**
```javascript
// Mongoose otomatik escape eder
User.findOne({ email: userInput });  // Safe
```

### Security Headers

```javascript
// Helmet.js (eklenmeli)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true
  }
}));
```

---

## Gelecek İyileştirmeler

### Özellik İyileştirmeleri

1. **Text Chat History**
   - Chat mesajlarını MongoDB'ye kaydet
   - Chat geçmişini göster

2. **User Profiles**
   - Profil fotoğrafı upload
   - Bio ekleme
   - İlgi alanları

3. **Friend System**
   - Beğendiğin kişiyi arkadaş ekle
   - Arkadaş listesi
   - Özel chat

4. **Reporting & Moderation**
   - Rapor sistemi genişletme
   - Admin dashboard
   - Otomatik moderation (AI)

5. **Virtual Backgrounds**
   - Arka plan blur
   - Virtual background seçenekleri
   - MediaPipe/TensorFlow.js ile

### Teknik İyileştirmeler

1. **Redis Cache**
   - Online user listesi
   - Match queue
   - Rate limiting

2. **CDN for Media**
   - Profil fotoğrafları için S3/Cloudinary
   - Video thumbnails

3. **Analytics**
   - Google Analytics
   - Mixpanel
   - Custom metrics

4. **Error Tracking**
   - Sentry integration
   - Error reporting
   - Performance monitoring

5. **Testing**
   - Unit tests (Jest)
   - Integration tests
   - E2E tests (Playwright)

---

## Faydalı Kaynaklar

### Öğrenme Kaynakları

**WebRTC:**
- https://webrtc.org/getting-started/overview
- https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API

**Next.js:**
- https://nextjs.org/docs
- https://nextjs.org/learn

**Socket.io:**
- https://socket.io/docs/v4/
- https://socket.io/get-started/chat

**MongoDB:**
- https://www.mongodb.com/docs/manual/
- https://mongoosejs.com/docs/

### Debugging Tools

**Browser DevTools:**
- `chrome://webrtc-internals` - WebRTC bağlantı detayları
- Network tab - Socket.io mesajları
- Console - Hata mesajları

**Backend Debugging:**
```javascript
// Debug logging
console.log('User connected:', socket.id);
console.log('Match found:', { user1, user2 });

// Socket.io debugging
const io = new Server(httpServer, {
  cors: { /* ... */ },
  transports: ['websocket', 'polling']
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
});
```

---

## Sonuç

Bu proje ile şunları öğrendiniz:

✅ **Full-stack development** (Frontend + Backend + Database)
✅ **Real-time communication** (Socket.io)
✅ **WebRTC** (P2P video chat)
✅ **Authentication** (JWT)
✅ **Cloud deployment** (Vercel + Render + MongoDB Atlas)
✅ **Problem solving** (Debug & fix production issues)
✅ **DevOps basics** (CI/CD, environment variables)
✅ **Security** (CORS, rate limiting, password hashing)

**Geliştirici:** Kaan
**Proje Başlangıç:** 2025-10-25
**İlk Production Deploy:** 2025-10-25
**Teknoloji Stack:** MERN + Next.js + WebRTC

---

**🎉 Tebrikler! Production-ready bir video chat uygulaması geliştirdiniz!**
