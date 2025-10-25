# 🚀 Bilgisayar Yeniden Başladıktan Sonra Yapılacaklar

## ⚡ Hızlı Başlatma (Tek Komut)

Terminalden şunu çalıştır:

```bash
cd /home/kaan/chat-app
./start.sh
```

Bu komut:
✅ MongoDB'yi başlatır
✅ Backend'i başlatır (yeni terminal)
✅ Frontend'i başlatır (yeni terminal)

---

## 🔧 Manuel Başlatma (Adım Adım)

Eğer script çalışmazsa manuel olarak:

### 1. MongoDB Başlat

```bash
docker start mongodb
```

Eğer container yoksa:
```bash
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_DATABASE=chat-app mongo:7
```

### 2. Backend Başlat

Yeni terminal aç:
```bash
cd /home/kaan/chat-app/backend
npm run dev
```

### 3. Frontend Başlat

Başka bir terminal aç:
```bash
cd /home/kaan/chat-app/frontend
npm run dev
```

---

## 🌐 Uygulama Linkleri

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

---

## 📹 ÖNEMLI: Kamera Ayarı

**Bilgisayarı yeniden başlattıktan sonra:**

1. BIOS'a gir (genellikle F2, F10, veya DEL tuşu)
2. "Integrated Camera" veya "Webcam" ayarını bul
3. **Enable/Aktif** yap
4. Kaydet ve çık

**Kamerayı test et:**
```bash
ls /dev/video*
```

Çıktı: `/dev/video0` (veya benzeri) görmelisiniz.

---

## 🔍 Sorun Giderme

### MongoDB bağlanamıyor?

```bash
docker ps -a
docker start mongodb
docker logs mongodb
```

### Port 3000/3001 kullanımda?

```bash
# Port'u kullanan process'i bul ve kapat
lsof -ti:3001 | xargs kill -9
```

### Kamera çalışmıyor?

1. BIOS'tan açık olduğundan emin ol
2. Başka uygulama kullanmıyor mu kontrol et:
   ```bash
   lsof /dev/video0
   ```

---

## 💾 Proje Konumu

```
/home/kaan/chat-app/
├── backend/          # Node.js backend
├── frontend/         # Next.js frontend
├── start.sh         # Hızlı başlatma scripti
└── README.md        # Ana dökümantasyon
```

---

## 📞 Claude Code ile Devam Etme

Claude Code sohbetleri **otomatik kaydedilir**.

Yeni sohbet başlatıp şunu yazabilirsin:
```
Canlı chat uygulaması üzerinde çalışıyorduk. Kaldığımız yerden devam edebilir miyiz?
```

---

## ✅ Checklist (Bilgisayar Açıldıktan Sonra)

- [ ] BIOS'tan kamerayı aç
- [ ] Bilgisayarı yeniden başlat
- [ ] `./start.sh` scriptini çalıştır
- [ ] http://localhost:3001 adresini aç
- [ ] Kamera iznini ver
- [ ] Test et!

---

**Son Güncelleme:** 2025-10-25
**Proje Durumu:** ✅ Çalışıyor - Kamera açılınca hazır!
