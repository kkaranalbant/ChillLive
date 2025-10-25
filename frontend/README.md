# Chat App Frontend

Next.js tabanlı video chat uygulaması frontend'i.

## Teknolojiler

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Socket.io Client
- Simple-peer (WebRTC)
- Zustand (State Management)
- Axios

## Kurulum

```bash
npm install
```

## Environment Variables

`.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_STUN_SERVER=stun:stun.l.google.com:19302
```

## Development

```bash
npm run dev
```

http://localhost:3000 adresinde açılacaktır.

## Build

```bash
npm run build
npm start
```

## Proje Yapısı

```
src/
├── app/                    # Next.js pages
│   ├── page.tsx           # Ana sayfa
│   ├── login/             # Giriş sayfası
│   ├── register/          # Kayıt sayfası
│   └── chat/              # Chat sayfası
├── components/            # React components
│   ├── VideoChat.tsx      # Video chat component
│   ├── TextChat.tsx       # Text chat component
│   ├── FilterModal.tsx    # Filtre modal
│   └── ReportModal.tsx    # Şikayet modal
├── stores/                # Zustand stores
│   ├── authStore.ts       # Auth state
│   └── chatStore.ts       # Chat state
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   └── socket.ts         # Socket.io client
├── hooks/                 # Custom hooks
│   └── useWebRTC.ts      # WebRTC hook
└── types/                 # TypeScript types
    └── index.ts
```

## Özellikler

- ✅ Responsive design
- ✅ Real-time video chat
- ✅ Text messaging
- ✅ User authentication
- ✅ Guest mode
- ✅ Filtering system
- ✅ Reporting system
- ✅ Modern UI/UX
