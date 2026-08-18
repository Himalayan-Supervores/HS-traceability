# Himalayan Supervores Traceability Platform

A real, usable farm-to-export traceability platform for Himalayan Supervores, a Nepalese agricultural
exporter: producers, products, lots, GS1-compliant QR Codes, and a public
mobile page that opens when a customer scans a code.

Built with Next.js 14 (App Router), PostgreSQL + Prisma, and a lightweight
custom admin auth — no third-party SaaS dependency, no "Orijin" or vendor
lock-in. Everything lives in your own database, on your own domain.

---

## 1. Architecture

| Layer | Choice | Why |
|---|---|---|
| Frontend + backend | **Next.js 14 (App Router)**, TypeScript | One codebase for the admin dashboard, the public GS1 pages, and the API — fewer moving parts than a separate frontend/backend, still a completely standard, well-documented stack. Server Components keep the public pages fast on mobile. |
| Database | **PostgreSQL** via **Prisma ORM** | Relational data (producer → product → lot) maps cleanly to SQL; Prisma gives type-safe queries and painless migrations. Free tiers exist (Neon, Supabase) that comfortably cover 100–10,000+ products. |
| Auth | Custom email/password + signed HTTP-only cookie (JWT via `jose`), passwords hashed with `bcryptjs` | One admin account doesn't need a full auth provider. No external dependency, no monthly cost, still industry-standard hashing and signed sessions. |
| QR Codes | Generated server-side with the `qrcode` npm package, on demand from the stored GS1 Digital Link URL | The QR image is never stored as a file — it's regenerated from the URL every time, so it's always in sync and there's nothing to keep consistent. |
| Hosting | **Vercel** (app) + **Neon or Supabase** (Postgres) | Both have free tiers sufficient for this project's stated scale (100 → low thousands of products). See [§13 Costs](#13-estimated-costs). |

If you'd genuinely prefer a different stack (e.g. a separate Express/Fastify
API, or Supabase entirely including auth), the data model and GS1 logic in
`src/lib/gs1.ts` are framework-agnostic and can be ported directly — but for
a project at this scale, splitting frontend/backend would add deployment
complexity without a real benefit.

---

## 2. What "GS1 compliant" actually means here

This project implements:

- **GTIN validation** (`src/lib/gs1.ts`) — the real GS1 mod-10 check digit
  algorithm, verified against a known-valid published EAN-13 barcode
  (`4006381333931`) during development, not just against our own demo data.
- **GS1 Digital Link URI syntax** — `https://{domain}/01/{GTIN}` and
  `https://{domain}/01/{GTIN}/10/{LOT}`, using the correct Application
  Identifiers (AI 01 = GTIN, AI 10 = BATCH/LOT NUMBER), with the GTIN always
  normalized to the canonical 14-digit form the standard requires.
- **A QR Code that never has to change** — because the resolver looks up the
  product/lot live from the database by GTIN, editing a product's name,
  photo, certification, or producer never invalidates a code that's already
  printed on a box.

What this project does **not** and **cannot** do for you: it cannot make a
GTIN "real". A GTIN is only genuinely GS1-compliant if it was assigned using
a **GS1 Company Prefix licensed to your company by GS1 Nepal** (or your
national GS1 Member Organisation). Every demo product seeded with this
project uses a GTIN starting with `2` — GS1's own "Restricted Circulation
Number" prefix range, explicitly reserved for internal/non-public use — and
is flagged `isDemoGtin = true` with a visible "DEMO" badge everywhere in the
UI. **Do not print these on real export packaging.** See
[§16 Going live with real GTINs](#16-going-live-with-real-gtins).

Before relying on this for real export documentation, cross-check your
implementation against the official GS1 documentation:
- GS1 Digital Link standard: https://www.gs1.org/standards/gs1-digital-link
- GS1 General Specifications (GTIN, check digits, Application Identifiers):
  https://www.gs1.org/genspecs
- GS1 Nepal (for obtaining a real GS1 Company Prefix / GTINs):
  https://www.gs1np.org

### GTIN vs SKU vs "QR Code" vs "GS1 Digital Link" — quick reference

| Term | What it is | Who defines it |
|---|---|---|
| **GTIN** | The number identifying *what* a trade item is (e.g. "5 kg carton of Alphonso mango from Himalayan Supervores") | GS1, via a Company Prefix licensed to your company |
| **SKU** | Your own internal warehouse/ERP code — free-form, means nothing outside your company | You — stored in `Product.sku`, never printed on the QR Code |
| **QR Code** | Just a barcode symbol — a container for data, no inherent meaning | ISO/IEC 18004 (the QR symbol standard itself) |
| **GS1 Digital Link** | A URL structure that encodes GS1 Application Identifiers, so the same QR Code that a GS1 scanner reads as structured data also opens as a normal web page | GS1 |

The same explanation is repeated as inline comments at the top of
`src/lib/gs1.ts`, next to the code that implements it.

---

## 3. Project structure

```
himalayan-supervores/
├─ prisma/
│  ├─ schema.prisma        # Producer, Product, Lot, QrCode, AdminUser, Settings
│  └─ seed.ts               # demo data (see §11)
├─ src/
│  ├─ app/
│  │  ├─ admin/             # protected dashboard (middleware-guarded)
│  │  │  ├─ page.tsx         # dashboard
│  │  │  ├─ products/        # list, /new, /[id]
│  │  │  ├─ producers/       # list, /new, /[id]
│  │  │  ├─ lots/            # list, /new, /[id]
│  │  │  ├─ qrcodes/         # list + /print
│  │  │  ├─ traceability/    # chain visualisation
│  │  │  └─ settings/
│  │  ├─ api/                # REST-ish JSON API (see §4)
│  │  ├─ 01/[gtin]/          # ★ public GS1 Digital Link product page
│  │  ├─ 01/[gtin]/10/[lot]/ # ★ public GS1 Digital Link lot page
│  │  ├─ producer/[id]/      # public producer page
│  │  └─ login/
│  ├─ components/            # admin/ + public/ React components
│  └─ lib/                   # db, auth, gs1, qrcode, validation, utils
├─ docker-compose.yml        # optional local Postgres
└─ .env.example
```

---

## 4. API (all under `/api`, JSON, admin-authenticated except where noted)

| Route | Methods | Notes |
|---|---|---|
| `/api/auth/login`, `/api/auth/logout` | POST | sets/clears the session cookie |
| `/api/producers`, `/api/producers/[id]` | GET, POST, PATCH, DELETE | supports `?q=&district=&status=` |
| `/api/products`, `/api/products/[id]` | GET, POST, PATCH, DELETE | supports `?q=&category=&producerId=&status=` |
| `/api/lots`, `/api/lots/[id]` | GET, POST, PATCH, DELETE | supports `?q=&status=&productId=` |
| `/api/qrcodes` | GET | list all generated codes |
| `/api/qrcodes/generate` | POST | `{ productId, lotId? }` → creates or reuses the QR Code |
| `/api/qrcodes/[id]/image` | GET | `?format=png\|svg`, streamed on demand |
| `/api/qrcodes/[id]` | PATCH, DELETE | activate/deactivate or remove |
| `/api/barcodes/gs1` | GET | `?productId=&format=png\|svg` — retail EAN-13/ITF-14 barcode |
| `/api/barcodes/gs1-128` | GET | `?productId=&lotId=&format=png\|svg` — logistics GS1-128 barcode |
| `/api/import/products` | POST | `{ csv: string }`, bulk product creation |
| `/api/export/products`, `/api/export/lots` | GET | CSV download |
| `/api/settings` | GET, PATCH | company name + Digital Link domain |

The public pages (`/01/[gtin]`, `/01/[gtin]/10/[lot]`, `/producer/[id]`) read
the database directly as React Server Components — they are not behind the
API or any authentication, by design (that's the whole point of the QR Code).

---

## 5. Data model

`Producer` → `Product` (many-to-one) → `Lot` (many-to-one) → `QrCode`
(many-to-one, scoped to a product or a specific lot). Full field list is in
`prisma/schema.prisma`, with comments; it matches the entities you specified
(Producteur, Produit, Lot, QR Code) field-for-field, plus a few housekeeping
fields (`createdAt`, `isDemoGtin`, etc.).

---

## 6. Security

- Admin routes (`/admin/*`) are protected by `src/middleware.ts`, checked on
  every request at the edge before any page or data loads.
- Every mutating API route independently re-checks the session
  (`requireAdmin()`), so the API is never reachable by forging a request
  straight to `/api/...` without a valid cookie.
- Passwords are hashed with `bcrypt` (never stored in plain text); the login
  response is identical whether the email exists or not, to avoid leaking
  registered accounts.
- Session cookies are `httpOnly`, `sameSite=lax`, and `secure` in production.
- All input is validated server-side with `zod` (`src/lib/validation.ts`)
  before touching the database — client-side validation is a convenience,
  never the only line of defence.
- Prisma's query builder parameterizes every query, which is what prevents
  SQL injection (no raw string-concatenated SQL is used anywhere).
- Public pages only ever expose fields you've chosen to make public: a
  producer with "Show on public producer page" turned off never appears on
  `/producer/[id]`, and inactive products/producers 404 on their public URL.
- Logs: Next.js/Vercel request logs plus Postgres logs are enough at this
  scale; see `AdminUser.lastLoginAt` for a basic login audit trail. If you
  need more, plug in a hosted logging service — that's outside this
  project's scope.

---

## 7. Design

Palette and type choices live in `tailwind.config.js` and `src/app/layout.tsx`:
deep pine green + a marigold/saffron accent (chosen over the more generic
"clay/terracotta" look), a serif display face (Fraunces) for headings, and a
monospace face for GTINs/lot numbers so codes are always easy to scan
visually. The public page is intentionally styled like an export
certificate — the audience is a B2B buyer in Europe or the Gulf deciding
whether to trust a shipment, not a consumer app.

---

## 8. Running it locally

**Prerequisites:** Node.js 20+, and a PostgreSQL database (local via Docker,
or a free hosted one — see §13).

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment template and fill it in
cp .env.example .env
# - DATABASE_URL: see below
# - AUTH_SECRET: generate with `openssl rand -base64 32`

# 3a. Option A — local Postgres via Docker
docker compose up -d
# DATABASE_URL in .env is already correct for this (localhost:5432/himalayan_supervores)

# 3b. Option B — no Docker: use a free hosted Postgres (Neon/Supabase),
#     paste its connection string into DATABASE_URL instead.

# 4. Create the database schema
npm run db:push

# 5. Load demo data (producers, products, lots, QR Codes)
npm run db:seed

# 6. Start the app
npm run dev
```

Open http://localhost:3000 — you'll land on `/admin`, prompting you to log
in. Use the seeded account: the email/password from `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` in your `.env` (defaults printed at the end of the
seed script output).

Try scanning: open `/01/2000090000018` in your browser (or point your
phone's camera at a QR Code generated from the admin) to see the public
mango product page; `/01/2000090000018/10/MNG26081601` shows the specific
seeded batch.

> **A note on this delivery:** this codebase was written and syntax-checked
> in a sandboxed environment without outbound access to Prisma's binary CDN
> (`binaries.prisma.sh`), so `prisma generate` / `npm run build` could not be
> executed end-to-end here. Every TypeScript/TSX file was individually
> parsed and transpiled without error, and the GS1 check-digit and Digital
> Link logic was run and verified directly (including against a real
> published EAN-13 barcode) — but you should still run `npm install && npm
> run build` yourself as your first step, and open an issue with the exact
> error if anything doesn't compile. A normal machine, CI runner, or Vercel
> build has no trouble reaching `binaries.prisma.sh`.

---

## 9. Deploying it

**Recommended path (cheapest, least ops):**

1. **Database — Neon** (https://neon.tech) or **Supabase**
   (https://supabase.com): create a free Postgres project, copy its
   connection string.
2. **App — Vercel** (https://vercel.com): import this repository (push it to
   GitHub first), set the environment variables from `.env.example` in the
   Vercel project settings (`DATABASE_URL`, `AUTH_SECRET`,
   `NEXT_PUBLIC_BASE_URL` = your real domain, `SEED_ADMIN_EMAIL` /
   `SEED_ADMIN_PASSWORD` only needed once for seeding), deploy.
3. Run `npx prisma db push` and `npm run db:seed` once against the
   production `DATABASE_URL` (from your machine, or a one-off Vercel/CI
   job) to create the schema and initial admin account.
4. In **Admin → Settings**, set the **domain** field to your real domain
   (e.g. `trace.himalayansupervores.com`) — this is what gets baked into every QR Code
   generated from then on.
5. Point your own domain at Vercel (Vercel's dashboard walks through the
   DNS records) so QR Codes read `himalayansupervores.com`, not `something.vercel.app`.

**Alternatives:** Railway or Render can host both the app and a Postgres
instance in one place if you'd rather not split across two providers — the
app has no Vercel-specific code, it's a standard Next.js build
(`npm run build && npm run start`).

---

## 10. Estimated costs

| Item | Free tier | When you'd need to pay |
|---|---|---|
| Vercel (app hosting) | Hobby plan: generous bandwidth/build minutes for a project this size | Team features or heavy traffic (~thousands of QR scans/day) — Pro plan from ~$20/month |
| Neon or Supabase (Postgres) | 0.5 GB storage, enough for tens of thousands of products/lots as plain text rows | Supabase Pro ~$25/month or Neon's paid tier once you outgrow the free storage/compute allowance — unlikely at "a few thousand products" |
| Domain name | — | ~$10–15/year from any registrar |
| **Total to start** | **$0/month** (+ the domain) | Realistically still $0–25/month even at several thousand products/lots |

This comfortably satisfies your requirement: "le système doit pouvoir
fonctionner avec 100 produits gratuitement ou à très faible coût."

---

## 11. Demo data

`npm run db:seed` creates:

- **3 producers**: Himalayan Farm (Chitwan), Chitwan Agro Farm (Chitwan),
  Kathmandu Mushroom Farm (Kathmandu)
- **6 products**, each with a demo GTIN (prefix `2…`, GS1's restricted/demo
  range): Mango (Alphonso), Ginger, Oyster Mushroom, Green Beans, Pumpkin
  Shoots, Fiddlehead Ferns
- **6 lots**, one per product, at different stages (in production, packed,
  shipped, delivered) with realistic dates and destinations
- **6 QR Codes**, one per lot, ready to scan immediately
- **1 admin account** (from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`)

Re-running `npm run db:seed` is safe — it upserts, so it won't duplicate data.

---

## 12. Import / export

**Admin → Products → Import CSV** accepts a CSV with (case-insensitive)
headers `gtin, product, variety, producer, origin, category, certification`
(only `gtin` and `product` are required — matches the format you specified).
Each row's GTIN is checked (format + check digit) before import; rows that
fail, or whose GTIN already exists, are skipped and listed in the result
summary, not silently dropped.

**Admin → Products / Lots → Export CSV** downloads the current filtered
list. Both round-trip through the same field names, so a round-trip
export → edit in Excel → re-import works.

---

## 13. How to add a new product

1. **Admin → Products → New product.**
2. Enter the **GTIN** GS1 actually issued you for this trade item (the form
   validates the check digit live as you type). If you don't have a real
   GTIN yet, tick "This is a demo/test GTIN" so it's clearly flagged.
3. Fill in name, category, producer, origin, packaging, certifications.
4. Save — you're taken to the product's page.
5. Click **Generate GS1 QR Code** (see §14) if you want a product-level code
   that isn't tied to a specific batch (useful for a general "learn about
   this product" code on marketing material). For codes that go on an
   actual shipping carton, create a **Lot** first (linked to this product)
   and generate the QR Code from the lot page instead — that gives buyers
   the specific harvest/packing/shipping dates for the box in front of them.

## 14. How to generate a QR Code

From a **Product** or a **Lot** page, click **Generate GS1 QR Code**. The app:

1. Builds the canonical GS1 Digital Link URL from the product's GTIN (and
   the lot number, if generated from a lot) and your company domain
   (**Admin → Settings**).
2. Stores that URL once. If you click generate again for the same
   product/lot, the existing code is reused — **the URL never changes**.
3. Renders a scannable PNG on screen immediately, with **PNG** and **SVG**
   download buttons and a **Print** button (opens a printable sheet — select
   several codes from **Admin → QR Codes** to print a batch of labels at
   once).

Editing the product or lot afterwards (new photo, corrected certification,
updated harvest date) never requires reprinting — the same QR Code keeps
resolving to the updated information, which was the whole point of using
GS1 Digital Link instead of a static per-print image.

## 14bis. GS1 Barcode and GS1-128 (linear barcodes)

Beyond the QR Code, two more code types live under their own tabs in the
sidebar, for cases where a QR Code isn't the right tool:

- **Admin → GS1 Barcode**: the classic black-and-white striped barcode
  (EAN-13) encoding a product's GTIN alone — what a retail point-of-sale
  scanner reads. If the GTIN is a genuine 14-digit case-level number (not
  padded from a shorter GTIN), it renders as ITF-14 instead, since EAN-13
  physically cannot carry 14 digits.
- **Admin → GS1-128**: a Code 128 barcode carrying GS1 Application
  Identifiers — GTIN, and when you pick a lot, also its batch/lot number,
  packing date, and net weight (if recorded in kg). This is the barcode
  used on shipping cartons and pallet labels for warehouse/logistics
  scanning, distinct from the retail barcode above.

Both pages let you pick a product (and, for GS1-128, optionally a lot) and
immediately preview the barcode, with PNG/SVG download buttons — no
separate "generate" step, since a linear barcode's content is deterministic
from the product/lot data already on file.

---

## 15. Testing what's built

Manual smoke test once you're running locally with seed data:

1. Log in at `/login`.
2. Dashboard shows 6 products / 3 producers / 6 lots / 6 QR Codes.
3. Products → search "mango" → open it → confirm GTIN, producer, and the
   existing QR Code card render.
4. Lots → open `MNG26081601` → confirm dates/destination, click **Print**.
5. Open the QR Code's **Open public page** link (or visit
   `/01/2000090000018/10/MNG26081601` directly) → confirm the public,
   mobile-styled traceability page renders with the correct chain.
6. Producers → Himalayan Farm → **Public page** → confirm only public fields
   show.
7. Products → **Export CSV**, edit a row, **Import CSV** it back → confirm
   the new row appears (existing GTINs are correctly skipped, not
   duplicated).
8. Try scanning an actual printed QR Code with a phone camera against your
   deployed URL once live.

---

## 16. Going live with real GTINs

1. Apply for a **GS1 Company Prefix** through **GS1 Nepal**
   (https://www.gs1np.org) — this is what makes every GTIN you build on it
   genuinely, globally unique and licensed to your company.
2. For each demo product, edit it in **Admin → Products**, replace the demo
   GTIN with your real one, and un-tick "demo GTIN".
3. Any QR Code already generated against the old demo GTIN will now be
   wrong — delete it from **Admin → QR Codes** and regenerate, then reprint
   packaging. This is the one case where the QR Code *does* need to change,
   because the GTIN itself changed, not just the product's details.
4. Set **Admin → Settings → domain** to your real, final production domain
   before printing anything at scale — changing it later invalidates every
   already-printed code (see the warning shown right on that field).

---

## Tech stack summary

Next.js 14 · TypeScript · Prisma · PostgreSQL · Tailwind CSS · zod ·
bcryptjs · jose (JWT) · qrcode · papaparse · lucide-react
