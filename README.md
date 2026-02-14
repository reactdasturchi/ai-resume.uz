# AI Rezyume – Client

Next.js 16.1.6 LTS (App Router). Production build: `next build --webpack`. + React Query + React Hook Form + Zod + Tailwind CSS + shadcn/ui.

## O‘rnatish

```bash
cd client
npm install
# yoki
bun install
```

`.env.local` yarating (ixtiyoriy, default: `http://localhost:4000`):

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Ishga tushirish

```bash
npm run dev
# yoki
bun run dev
```

Brauzer: [http://localhost:3000](http://localhost:3000). Backend `http://localhost:4000` da ishlashi kerak.

## Texnologiyalar

- **Next.js 14** – App Router
- **React Query** – server state, cache
- **React Hook Form + Zod** – formlar va validatsiya
- **Tailwind CSS** – stillar
- **shadcn/ui** – Button, Card, Input, Select, Dialog, Tabs, Toast, va b.
- **Fontlar** – Fraunces (sarlavha), DM Sans (matn)

## Sahifalar

- `/` – Bosh sahifa (landing, tariflar, qanday ishlaydi)
- `/resume/builder` – Rezyume yaratish (AI prompt formasi)
- `/login` – Kirish
- `/register` – Ro‘yxatdan o‘tish
- `/profile` – Profil (avatar, shaxsiy ma'lumotlar, token/rezyume)
- `/resumes` – Rezyumelar ro‘yxati
- `/resume/[id]` – Rezyume ko‘rinishi, AI yaxshilash, PDF yuklash

## Debug: "Not Found" xatosi

Agar profil yoki boshqa sahifalarda "Not Found" ko‘rsatsa:

1. Backend server `http://localhost:4000` da ishlayotganini tekshiring
2. `client/.env.local` da `NEXT_PUBLIC_API_URL=http://localhost:4000` bo‘lishini tekshiring
3. CORS sozlamalari (`server/.env` da `CORS_ORIGIN=http://localhost:3000`) to‘g‘ri ekanligini tekshiring
