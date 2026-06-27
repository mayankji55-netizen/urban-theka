# QR Ordering SaaS

Production-oriented multi-tenant restaurant QR ordering SaaS built with Next.js 15, TypeScript, Tailwind CSS, ShadCN-style components, Supabase Auth, PostgreSQL, Storage, Realtime, React Query, Zustand, Zod, and Server Actions.

## Features

- Restaurant owner onboarding, authentication, protected routes, and role-aware navigation.
- Multi-tenant PostgreSQL schema with RLS policies for restaurants, members, tables, menu, orders, and order items.
- Customer QR menu at `/r/[slug]/table/[tableNumber]` with search, category tabs, badges, cart, tax, service charge, checkout, and live order tracking.
- Admin dashboard with daily metrics, menu CRUD, table QR generation/download, settings, analytics chart, and CSV/Excel sales export endpoint.
- Kitchen dashboard with realtime order updates, drag/drop status changes, and new-order tone.
- Optional WhatsApp webhook trigger via `WHATSAPP_WEBHOOK_URL`.

## Setup

1. Copy `.env.example` to `.env.local` and fill Supabase keys.
2. Run the SQL in `supabase/migrations/001_initial_schema.sql` in your Supabase project.
3. Install dependencies with `npm install`.
4. Start locally with `npm run dev`.

## Deployment

Deploy to Vercel, add the same environment variables, and point `NEXT_PUBLIC_APP_URL` to the production domain.
