# ChillLive - Production Deployment Guide

Bu guide Vercel (Frontend) + Render (Backend) deployment'ını adım adım açıklar.

## 📋 Ön Hazırlık

### ✅ Tamamlananlar:
- [x] GitHub repo oluşturuldu: https://github.com/kkaranalbant/ChillLive
- [x] MongoDB Atlas hesabı hazır
- [x] render.yaml config dosyası eklendi
- [x] vercel.json config dosyası eklendi
- [x] TypeScript build hataları düzeltildi
- [x] Health check endpoints eklendi

### 🔑 İhtiyaç Duyulacak Bilgiler:

**MongoDB Atlas:**
- Connection String: `mongodb+srv://karanalbant90_db_user:DIKFk7UwYU1A8yfn@myome.ffyo1xt.mongodb.net/chat-app?retryWrites=true&w=majority&appName=MyOme`

**JWT Secrets (backend/.env'den kopyala):**
- JWT_ACCESS_SECRET: `71636d4323c709ac8bf396deee69697cad4ddbbc099345c39c621a848bee9a44bd9f9753a28de3300eb2973fbf72ba62e3f8c1b27780456154c90f20e00cb977`
- JWT_REFRESH_SECRET: `5e31fd47b5f3a939fdd76c4cfa33fe51ff8216f8aa94212be103edce0389587bf5f01d755d5b7a48a299301c8aecaed6902c563f66ac6fd4d55f4ef3f11ead75`

---

## 🚀 Step 1: Backend Deployment (Render)

### 1.1 Render Hesabı Oluştur
1. https://render.com adresine git
2. "Get Started for Free" tıkla
3. GitHub ile giriş yap
4. GitHub repo'ya erişim izni ver

### 1.2 Backend Service Oluştur
1. Dashboard'da "New +" → "Web Service" seç
2. GitHub repo seç: `kkaranalbant/ChillLive`
3. Ayarları doldur:
   - **Name:** `chilllive-backend`
   - **Region:** `Frankfurt (EU Central)`
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

### 1.3 Environment Variables Ekle
"Environment" sekmesinde şu değişkenleri ekle:

```bash
NODE_ENV=production
PORT=10000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://karanalbant90_db_user:DIKFk7UwYU1A8yfn@myome.ffyo1xt.mongodb.net/chat-app?retryWrites=true&w=majority&appName=MyOme

# JWT Secrets
JWT_ACCESS_SECRET=71636d4323c709ac8bf396deee69697cad4ddbbc099345c39c621a848bee9a44bd9f9753a28de3300eb2973fbf72ba62e3f8c1b27780456154c90f20e00cb977
JWT_REFRESH_SECRET=5e31fd47b5f3a939fdd76c4cfa33fe51ff8216f8aa94212be103edce0389587bf5f01d755d5b7a48a299301c8aecaed6902c563f66ac6fd4d55f4ef3f11ead75
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS (Vercel URL'i eklenecek - şimdilik boş bırak)
CORS_ORIGIN=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 1.4 Deploy Et
1. "Create Web Service" tıkla
2. Deployment başlayacak (3-5 dakika)
3. Deployment tamamlanınca URL'i not al: `https://chilllive-backend.onrender.com`

### 1.5 Test Et
```bash
curl https://chilllive-backend.onrender.com/api/health
# Beklenen: {"status":"ok","timestamp":"2025-..."}
```

---

## 🎨 Step 2: Frontend Deployment (Vercel)

### 2.1 Vercel Hesabı Oluştur
1. https://vercel.com adresine git
2. "Start Deploying" → "Continue with GitHub"
3. GitHub ile giriş yap

### 2.2 Yeni Proje Oluştur
1. "Add New..." → "Project" seç
2. GitHub repo'yu seç: `kkaranalbant/ChillLive`
3. "Import" tıkla

### 2.3 Proje Ayarları
1. **Framework Preset:** Next.js (otomatik algılar)
2. **Root Directory:** `frontend` (Edit ile değiştir)
3. **Build Command:** `npm run build` (default)
4. **Output Directory:** `.next` (default)
5. **Install Command:** `npm install` (default)

### 2.4 Environment Variables Ekle
"Environment Variables" bölümüne şunları ekle:

```bash
NEXT_PUBLIC_API_URL=https://chilllive-backend.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://chilllive-backend.onrender.com
```

### 2.5 Deploy Et
1. "Deploy" tıkla
2. Build başlayacak (2-3 dakika)
3. Deployment tamamlanınca URL'i not al: `https://chilllive-*.vercel.app`

---

## 🔗 Step 3: Backend CORS Ayarını Güncelle

### 3.1 Vercel URL'ini Render'a Ekle
1. Render dashboard'a dön: https://dashboard.render.com
2. `chilllive-backend` service'ini seç
3. "Environment" sekmesine git
4. `CORS_ORIGIN` değişkenini güncelle:

```bash
CORS_ORIGIN=https://chilllive-<YOUR-URL>.vercel.app
```

5. "Save Changes" tıkla
6. Service otomatik restart olacak (30 saniye)

---

## ✅ Step 4: Test Et

### 4.1 Backend Test
```bash
# Health check
curl https://chilllive-backend.onrender.com/api/health

# Guest login
curl -X POST https://chilllive-backend.onrender.com/api/auth/guest \
  -H "Content-Type: application/json" \
  -d '{"username":"TestUser"}'
```

### 4.2 Frontend Test
1. Vercel URL'ini aç: `https://chilllive-*.vercel.app`
2. "Hızlı Başla" butonuna tıkla
3. Guest olarak giriş yaptığını kontrol et
4. İki farklı tarayıcıda aç ve eşleşmeyi test et

### 4.3 WebRTC Test
1. İki farklı cihaz/tarayıcı ile siteye gir
2. İkisi de "Eşleşme Ara" yapsın
3. Birbirlerini görüp göremediklerini kontrol et
4. Kamera/mikrofon izinlerini ver

---

## 📝 Step 5: Son Ayarlar

### 5.1 MongoDB Atlas Network Access
1. https://cloud.mongodb.com → Network Access
2. "0.0.0.0/0" (Allow from anywhere) aktif olduğundan emin ol
3. Veya Render IP'lerini whitelist'e ekle

### 5.2 Custom Domain (Opsiyonel)
Eğer kendi domain'in varsa (örn: chilllive.com):

**Vercel:**
1. Project Settings → Domains
2. Domain ekle ve DNS ayarlarını yap

**Render:**
1. Service Settings → Custom Domain
2. Alt domain ekle (örn: api.chilllive.com)

### 5.3 GitHub Otomatik Deploy
Her iki platform da GitHub'a push edildiğinde otomatik deploy eder:
```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel ve Render otomatik deploy başlatır
```

---

## 🎉 Tamamlandı!

Uygulamanız şu adreslerde yayında:
- **Frontend:** https://chilllive-*.vercel.app
- **Backend:** https://chilllive-backend.onrender.com

### Önemli Notlar:
- ✅ **Ücretsiz:** Her iki platform da ücretsiz tier
- ⚠️ **Cold Start:** Render free tier 15 dakika inaktif sonra uyur (ilk istek 30 saniye sürebilir)
- ✅ **Auto SSL:** HTTPS otomatik
- ✅ **Auto Deploy:** Git push ile otomatik deployment
- ✅ **MongoDB Atlas:** M0 tier 512MB ücretsiz

### Sorun Giderme:
- **Render logs:** Dashboard → Logs sekmesi
- **Vercel logs:** Deployment → View Function Logs
- **MongoDB logs:** Atlas → Database → Metrics

---

**Geliştirici:** Kaan
**Tarih:** 2025-10-25
