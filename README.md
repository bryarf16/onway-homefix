# HomeFix

A full-stack home service booking application connecting homeowners with local technicians (plumbers, electricians, cleaners, and HVAC specialists). Includes an admin management dashboard and a bilingual customer mobile app supporting English and Central Kurdish (Sorani) with dynamic RTL layouts.

## Repository Structure

The monorepo contains three main applications:

- **`apps/api`**: REST API built with Bun, Hono, Drizzle ORM, and PostgreSQL. Handles authentication, provider directories, and booking management.
- **`apps/dashboard`**: Admin web application built with Next.js (App Router), Tailwind CSS, TanStack Query, and React Hook Form. Used for dispatching and managing booking lifecycles.
- **`apps/mobile`**: Customer mobile client built with React Native and Expo Router. Supports search, category filtering, booking submissions, and live status tracking.

## Tech Stack

- **Backend**: Bun, Hono, Drizzle ORM, PostgreSQL, Zod, JWT
- **Dashboard**: Next.js 16, React 19, Tailwind CSS, TanStack Query, i18next
- **Mobile**: React Native, Expo (SDK 58), Expo Router, AsyncStorage
- **Database**: PostgreSQL 16 (via Docker Compose)

## Quick Start

### 1. Start the Database

Run PostgreSQL using Docker:

```bash
docker compose up -d
```

### 2. Setup and Seed the API

```bash
cd apps/api
bun install
bun run db:push
bun run db:seed
bun run dev
```

The API runs at `http://localhost:3001`. A health check is available at `http://localhost:3001/health`.

### 3. Start the Admin Dashboard

In a separate terminal:

```bash
cd apps/dashboard
bun install
bun run dev
```

The dashboard will be available at `http://localhost:3000`.

### 4. Start the Mobile App

In a separate terminal:

```bash
cd apps/mobile
bun install
bun run web
```

The mobile client will be available at `http://localhost:8081`. You can test it in a desktop browser or inspect it using mobile device emulation in browser developer tools.

## Demo Accounts

The database seed includes pre-configured accounts:

| Role | Email | Password | Platform |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@homefix.test` | `admin123` | Dashboard (`:3000/login`) |
| **Customer** | `customer@homefix.test` | `customer123` | Mobile (`:8081/login`) |

## Key Features

- **Booking Workflow**: Status transitions follow a controlled lifecycle: `pending` -> `confirmed` -> `in_progress` -> `completed` (or `cancelled`).
- **Bilingual & RTL**: Full English (LTR) and Kurdish Sorani (RTL) localization across both the mobile app and admin dashboard with instant language switching.
- **Local Network Testing**: Mobile client automatically resolves the host machine IP for seamless cross-device testing over LAN.
