# HomeFix — Mini Service Booking Platform

A mini service booking monorepo platform built for the **OnWay Developer Trial Task**. Customers can browse home services, select verified local providers (plumbers, electricians, cleaners, HVAC technicians), submit service bookings, and track status live in either English or Central Kurdish (Sorani) with full RTL support. Admins manage categories, providers, and advance bookings through a strictly enforced state machine.

---

## 1. Architecture Overview & Monorepo Structure

The project is structured as a clean TypeScript monorepo across three coordinated layers:

```
homefix-trial/
├── apps/
│   ├── api/          # Backend: Bun + Hono + Drizzle ORM + PostgreSQL + Zod + JWT
│   ├── dashboard/    # Admin Web: Next.js 16 (App Router) + Tailwind CSS + i18n EN/CKB
│   └── mobile/       # Customer App: React Native + Expo Router + i18n EN/CKB + RTL
├── docker-compose.yml # PostgreSQL database container
└── README.md
```

### Core Stack & Versions
- **Backend API**: Bun `v1.2.x`, Hono `v4.7.x`, Drizzle ORM `v0.39.x`, Zod `v3.24.x`, PostgreSQL 16
- **Admin Dashboard**: Next.js `16.1.x`, React `19.x`, Tailwind CSS `v4`, TypeScript `5.x`
- **Mobile Customer App**: Expo SDK `58`, Expo Router `v58`, React Native `0.88`, AsyncStorage
- **Languages / Localization**: English (LTR) & Central Kurdish / Sorani (RTL) with dynamic layout flipping

---

## 2. Environment Variables

Create `.env` in the appropriate app directories if needed:

### Backend (`apps/api/.env`)
```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/homefix
JWT_SECRET=homefix-secret-jwt-key-2026
```

### Admin Dashboard (`apps/dashboard/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Customer Mobile App (`apps/mobile/.env`)
*Dynamic API discovery is integrated: Expo automatically detects your local IP for mobile devices and falls back to `http://localhost:3001/api/v1` for web and iOS simulator, or `10.0.2.2:3001` for Android emulator.*

---

## 3. Demo Credentials

| Role | Email | Password | Access Location |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@homefix.test` | `admin123` | Admin Dashboard (`http://localhost:3000/login`) |
| **Demo Customer** | `customer@homefix.test` | `customer123` | Mobile App (`http://localhost:8081` / Expo) |

> **Note:** The Mobile Login screen features a 1-tap **"Fill Demo Customer" / "کڕیاری تێست (خێرا)"** button for instant evaluation.

---

## 4. Local Setup & Running Steps

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js 20+
- [Docker](https://www.docker.com/) (for running PostgreSQL)

### Step 1: Start PostgreSQL Database
From the monorepo root:
```bash
docker compose up -d
```
*(Runs Postgres 16 on port 5432 with database `homefix`)*

### Step 2: Database Migration & Seeding
Navigate to `apps/api`:
```bash
cd apps/api
bun install

# Run database migrations
bun run db:push

# Run seed script (creates admin, customer, categories, providers)
bun run db:seed
```

### Step 3: Start Backend API
```bash
cd apps/api
bun run dev
```
*API runs at `http://localhost:3001`. Verify health at `http://localhost:3001/health`.*

### Step 4: Start Admin Dashboard
In a new terminal:
```bash
cd apps/dashboard
bun install
bun run dev
```
*Dashboard runs at `http://localhost:3000`. Log in with `admin@homefix.test` / `admin123`.*

### Step 5: Start Customer Mobile App
In a new terminal:
```bash
cd apps/mobile
bun install
bun run web    # or: npx expo start --web
```
*Mobile app launches in the browser at `http://localhost:8081`. You can inspect in Chrome DevTools using mobile device simulation (e.g. iPhone 14/15/16 Pro) for pixel-perfect responsiveness.*

---

## 5. API Examples (cURL)

### 1. Health Check
```bash
curl -X GET http://localhost:3001/health
```
**Response:**
```json
{
  "success": true,
  "message": "API and database are healthy",
  "data": { "status": "ok", "database": "connected" }
}
```

### 2. Login (Customer or Admin)
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@homefix.test","password":"customer123"}'
```

### 3. Create a Booking (Customer)
```bash
curl -X POST http://localhost:3001/api/v1/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <CUSTOMER_JWT_TOKEN>" \
  -d '{
    "providerId": "<PROVIDER_UUID>",
    "customerName": "Demo Customer",
    "phone": "07501234567",
    "address": "Erbil, Bakhtiyari, Street 14",
    "scheduledAt": "2026-10-25T10:00:00.000Z",
    "notes": "AC unit blowing warm air, needs refrigerant check"
  }'
```

### 4. Update Booking Status (Admin — Strictly Enforced State Machine)
```bash
curl -X PATCH http://localhost:3001/api/v1/bookings/<BOOKING_UUID>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -d '{"status":"confirmed"}'
```

---

## 6. Business Logic & State Machine

Booking transitions strictly follow the required state machine:
```
           ┌──────────┐
           │ pending  │
           └────┬─────┘
                │
                ▼
          ┌───────────┐
          │ confirmed │
          └─────┬─────┘
                │
                ▼
        ┌─────────────┐
        │ in_progress │
        └───────┬─────┘
                │
                ▼
          ┌───────────┐
          │ completed │
          └───────────┘
```
- Active bookings can transition to `cancelled` from `pending`, `confirmed`, or `in_progress`.
- Invalid status jumps (e.g., attempting `pending` → `completed` directly) are rejected with HTTP 400 and an explicit validation message.

---

## 7. Bilingual & RTL Support (EN ↔ CKB)

- Complete translation dictionaries for all interface elements (navigation, headings, buttons, badges, errors, and empty states).
- Instant layout flipping without requiring application restart:
  - **Web Admin**: Sets `dir="rtl"` on `<html>`, adjusts alignment, margins, and flex ordering.
  - **Mobile App**: Dynamic flex inversion (`flexRowStyle`, `alignText`) and icon mirror inversion (`chevron-forward` / `chevron-back`).

---

## 8. Known Limitations & Future Improvements

1. **Push Notifications**: Currently stubbed with user alerts. In production, integrate Firebase Cloud Messaging (FCM) / Apple APNs for status transition updates.
2. **WebSocket / Live Sync**: Implemented reactive pull-to-refresh on mobile; integrate Socket.io or Server-Sent Events (SSE) for zero-latency bidirectional updates.
3. **Map Pinning**: Address input is currently structured text; integrate Google Maps / OpenStreetMap SDK for visual geofenced delivery pins.
