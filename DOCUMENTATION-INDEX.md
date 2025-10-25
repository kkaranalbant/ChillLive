# 📚 Dokümantasyon İndeksi - Video Chat Uygulaması

**Proje Konumu:** `/home/kaan/chat-app/`
**Son Güncelleme:** 2025-10-25

---

## 🗂️ Dosya Yapısı

```
/home/kaan/chat-app/
├── 📋 Dokümantasyon (Okumanız Gerekenler)
│   ├── README.md                    # Ana proje dokümantasyonu
│   ├── BAŞLANGIÇ-REHBERİ.md        # Bilgisayarı açtıktan sonra yapılacaklar
│   ├── SESSION-NOTES.md            # Bugünkü konuşma özeti
│   ├── PROJECT-STATUS.md           # Proje durumu ve tamamlanma oranı
│   ├── DEVELOPMENT-LOG.md          # Teknik değişiklikler ve kod geçmişi
│   ├── NEXT-STEPS.md               # Sıradaki adımlar ve yapılacaklar
│   ├── TROUBLESHOOTING.md          # Sorun giderme rehberi
│   └── DOCUMENTATION-INDEX.md      # Bu dosya (rehber)
│
├── 🚀 Hızlı Başlatma
│   └── start.sh                    # Otomatik başlatma scripti
│
├── 💻 Backend (Node.js)
│   ├── src/
│   │   ├── server.ts
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── socket/
│   │   └── services/
│   ├── .env
│   ├── package.json
│   └── README.md
│
└── 🌐 Frontend (Next.js)
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── hooks/
    │   ├── stores/
    │   └── lib/
    ├── .env.local
    ├── package.json
    └── README.md
```

---

## 📖 Hangi Dosyayı Ne Zaman Okumalıyım?

### 🆕 İlk Kez Başlıyorsanız

**1. Sıra:** `README.md`
- Proje hakkında genel bilgi
- Özellikler ve teknoloji stack
- Kurulum talimatları

**2. Sıra:** `BAŞLANGIÇ-REHBERİ.md`
- Bilgisayarı açtıktan sonra yapılacaklar
- Hızlı başlatma komutları
- Checklist

**3. Sıra:** `start.sh` çalıştır
```bash
cd /home/kaan/chat-app
./start.sh
```

---

### 🔄 Kaldığınız Yerden Devam Ediyorsanız

**1. Okuyun:** `SESSION-NOTES.md`
- Son konuşmada neler yaptık?
- Hangi sorunlar çözüldü?
- Nerede kaldık?

**2. Kontrol Edin:** `PROJECT-STATUS.md`
- Neyi tamamladık? ✅
- Ne eksik? ⏳
- Bilinen sorunlar var mı? 🐛

**3. Planlayın:** `NEXT-STEPS.md`
- Sırada ne var?
- Nasıl devam edeceksiniz?
- Test planı nedir?

---

### 🐛 Sorun Yaşıyorsanız

**İlk Adım:** `TROUBLESHOOTING.md`
- Sık karşılaşılan sorunlar
- Hata mesajları ve çözümleri
- Debug komutları
- Acil durum komutları

**İkinci Adım:** Log dosyalarını kontrol
```bash
# Backend logs
cd backend && npm run dev

# Frontend logs (Browser console F12)

# MongoDB logs
docker logs mongodb
```

---

### 🔧 Geliştirme Yapıyorsanız

**Teknik Detaylar:** `DEVELOPMENT-LOG.md`
- Kod değişiklikleri
- API endpoint'leri
- Schema tanımları
- Konfigürasyonlar

**Backend Dokümantasyon:** `backend/README.md`
- API endpoints
- Socket events
- Environment variables

**Frontend Dokümantasyon:** `frontend/README.md`
- Component yapısı
- State management
- Routing

---

## 🎯 Senaryoya Göre Rehber

### Senaryo 1: "Bilgisayarı yeni açtım, uygulamayı çalıştırmak istiyorum"

```
1. BAŞLANGIÇ-REHBERİ.md oku
2. Kamerayı BIOS'tan aç (gerekirse)
3. ./start.sh çalıştır
4. http://localhost:3001 aç
5. Test et!
```

### Senaryo 2: "Uygulama çalışmıyor, hata alıyorum"

```
1. TROUBLESHOOTING.md aç
2. Hata mesajını bul
3. Çözümü uygula
4. Hala çalışmazsa Claude Code'a sor
```

### Senaryo 3: "Bir hafta sonra kaldığım yerden devam etmek istiyorum"

```
1. SESSION-NOTES.md oku (son durumu öğren)
2. PROJECT-STATUS.md kontrol et (ne tamamlandı?)
3. NEXT-STEPS.md oku (sırada ne var?)
4. ./start.sh ile başlat
```

### Senaryo 4: "Yeni özellik eklemek istiyorum"

```
1. DEVELOPMENT-LOG.md oku (mevcut yapı)
2. NEXT-STEPS.md kontrol et (planlanmış mı?)
3. backend/README.md veya frontend/README.md
4. Kod yaz
5. DEVELOPMENT-LOG.md güncelle
```

### Senaryo 5: "Projeyi başkasına devretmek istiyorum"

```
Sırayla okusunlar:
1. README.md
2. PROJECT-STATUS.md
3. DEVELOPMENT-LOG.md
4. BAŞLANGIÇ-REHBERİ.md
5. start.sh ile test etsinler
```

---

## 🔍 Hızlı Arama

### Kamera Sorunları
→ `TROUBLESHOOTING.md` → "3. Kamera Bulunamadı"
→ `BAŞLANGIÇ-REHBERİ.md` → "BIOS kamera ayarı"

### MongoDB Bağlantı Hatası
→ `TROUBLESHOOTING.md` → "1. MongoDB Bağlanamıyor"

### WebRTC Bağlantı Sorunu
→ `TROUBLESHOOTING.md` → "5. WebRTC Bağlanamıyor"
→ `NEXT-STEPS.md` → "TURN Server Ekle"

### API Endpoint'leri
→ `DEVELOPMENT-LOG.md` → "API Değişiklikleri"
→ `backend/README.md` → "API Endpoints"

### Socket Events
→ `PROJECT-STATUS.md` → "Socket Events"
→ `DEVELOPMENT-LOG.md` → "Socket Events"

### Deployment
→ `NEXT-STEPS.md` → "Deployment Planı"

### Yeni Özellik Ekleme
→ `NEXT-STEPS.md` → "Yapılacaklar Listesi"
→ `PROJECT-STATUS.md` → "Eksik Özellikler"

---

## 📞 Claude Code ile Devam Etme

Yeni sohbet başlatırken şunu yazın:

```
Merhaba! Daha önce video chat uygulaması geliştirmiştik.

Proje konumu: /home/kaan/chat-app/

[Durumunuza göre birini seçin:]

Option 1: "SESSION-NOTES.md dosyasını okuyarak kaldığımız yerden devam edelim."
Option 2: "TROUBLESHOOTING.md'ye bakarak şu hatayı çözmeme yardım et: [hata]"
Option 3: "NEXT-STEPS.md'deki [özellik] özelliğini eklemek istiyorum."
```

---

## 📊 Dosya Özeti

| Dosya | Amaç | Ne Zaman Oku? | Öncelik |
|-------|------|---------------|---------|
| `README.md` | Proje tanıtımı | İlk kez | 🔴 Yüksek |
| `BAŞLANGIÇ-REHBERİ.md` | Başlatma rehberi | Her defasında | 🔴 Yüksek |
| `SESSION-NOTES.md` | Konuşma özeti | Devam ederken | 🟡 Orta |
| `PROJECT-STATUS.md` | Proje durumu | Devam ederken | 🟡 Orta |
| `DEVELOPMENT-LOG.md` | Teknik detaylar | Geliştirirken | 🟢 Düşük |
| `NEXT-STEPS.md` | Yapılacaklar | Planlama yaparken | 🟡 Orta |
| `TROUBLESHOOTING.md` | Sorun giderme | Hata alınca | 🔴 Yüksek |
| `start.sh` | Otomatik başlatma | Her seferinde | 🔴 Yüksek |

---

## ✅ Hızlı Checklist

Proje ile çalışmaya başlamadan önce:

- [ ] `BAŞLANGIÇ-REHBERİ.md` okudum
- [ ] Kamera BIOS'tan açık
- [ ] MongoDB Docker'da çalışıyor
- [ ] `./start.sh` çalıştırdım
- [ ] Backend ve Frontend ayakta
- [ ] Tarayıcıda http://localhost:3001 açık

Sorun yaşarsam:

- [ ] `TROUBLESHOOTING.md` kontrol ettim
- [ ] Logları inceledim
- [ ] Hala çözülmezse Claude Code'a sordum

---

## 💡 Pro Tips

1. **Her zaman start.sh kullan** - Manuel başlatmadan daha güvenli
2. **TROUBLESHOOTING.md'yi favorilere ekle** - Sık ihtiyaç duyacaksın
3. **SESSION-NOTES.md'yi güncel tut** - Her değişikliği not et
4. **Logları kaydet** - Debug için değerli

---

## 🎓 Öğrenme Sırası (Yeni Başlıyorsanız)

Projeyi anlamak için bu sırayla okuyun:

```
1. README.md               (15 dk) - Proje nedir?
2. PROJECT-STATUS.md       (10 dk) - Ne durumda?
3. DEVELOPMENT-LOG.md      (20 dk) - Nasıl çalışıyor?
4. backend/README.md       (10 dk) - Backend yapısı
5. frontend/README.md      (10 dk) - Frontend yapısı
6. NEXT-STEPS.md           (15 dk) - Ne yapacağız?

Toplam: ~1.5 saat
```

---

**Son Not:** Bu dokümantasyon canlıdır. Proje geliştikçe güncellenecektir.

**Sorunuz mu var?** Claude Code'a sorun: "DOCUMENTATION-INDEX.md okudum, [sorunuz] hakkında bilgi almak istiyorum."
