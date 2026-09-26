<div align="center">

# 📦 StockSense
### *Next-Generation Ledger-Driven Inventory Management System*

**An enterprise-grade, modular IMS replacing fragmented spreadsheets and manual registers with a real-time, immutable double-entry inventory ledger.**

<p align="center">
  <a href="https://github.com/ayush300302/StockLedger"><img src="https://img.shields.io/badge/Odoo_Hackathon-2026_Submission-714B67?style=for-the-badge&logo=odoo&logoColor=white" alt="Odoo Hackathon 2026"></a>
  <a href="https://github.com/ayush300302/StockLedger"><img src="https://img.shields.io/badge/Sprint-5--Hour_Build_Window-0284c7?style=for-the-badge&logo=clock&logoColor=white" alt="5-Hour Build"></a>
  <a href="https://github.com/ayush300302/StockLedger"><img src="https://img.shields.io/badge/Architecture-Immutable_Ledger-7c3aed?style=for-the-badge&logo=databricks&logoColor=white" alt="Architecture"></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Backend-Supabase_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/Frontend-React_18_+_Vite-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Styling-Tailwind_CSS-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
</p>

---

<p align="center">
  <a href="#1-the-core-idea-read-this-before-writing-any-code"><b>💡 The Core Idea</b></a> •
  <a href="#-documentation--deliverables"><b>📚 Documentation</b></a> •
  <a href="#2-tech-stack"><b>🛠️ Tech Stack</b></a> •
  <a href="#3-data-model"><b>🗄️ Data Model</b></a> •
  <a href="#4-features--requirement-mapping"><b>🎯 Requirements</b></a> •
  <a href="#8-getting-started"><b>🚀 Quick Start</b></a> •
  <a href="#-team--roles"><b>👥 Team</b></a>
</p>

---

</div>

> [!IMPORTANT]
> **The Immutable Ledger Guarantee:** In StockSense, on-hand inventory quantity is **never statically stored** on product rows. All balances are derived on-the-fly via the `stock_on_hand` view over the append-only `stock_move` transaction ledger. This mathematically guarantees 100% auditability and eliminates synchronization bugs, race conditions, and ledger discrepancies.

### 👥 Team & Roles
| Contributor | Focus & Responsibilities | GitHub Profile |
| :--- | :--- | :--- |
| **Sudhanshu Biswas** | System Architecture, Postgres Relational Schema, Derived Views & RPCs | [@SudhanshuBiswas01](https://github.com/SudhanshuBiswas01) |
| **Ayush Patil** | Frontend Engineering, Ledger UI, TanStack State Management & Routing | [@ayush300302](https://github.com/ayush300302) |
| **Shubham Rangdal** | Document State Machines (`Draft` ➔ `Done`), Validations & Testing | Core Team |

### ⚡ Build Specifications
- **Build Window:** 5 Hours (Hourly commit cadence `h0` … `h5`)
- **Submission:** Odoo Hackathon 2026
- **Architecture Paradigm:** Double-entry ledger (`VENDOR` / `CUSTOMER` / `INVENTORY_LOSS` ↔ Internal locations)

### 📚 Documentation & Deliverables
| Document | Purpose & Overview |
| :--- | :--- |
| 📋 [**`docs/PRD.md`**](docs/PRD.md) | Personas, user stories, functional/non-functional requirements, KPIs & acceptance gates |
| 🏛️ [**`docs/HLD.md`**](docs/HLD.md) | High-Level Design: System architecture, relational design, state machines & ADRs |
| ⏱️ [**`docs/BUILD_PLAN.md`**](docs/BUILD_PLAN.md) | 5-hour breakdown, hourly checkpoints (`h0`–`h5`), git strategy & contingency paths |
| 🤖 [**`docs/MASTER_PROMPTS.md`**](docs/MASTER_PROMPTS.md) | Phase-wise orchestrator prompts with strict architectural guardrails for AI coding agents |
| 🗄️ [**`db/schema.sql`**](db/schema.sql) | DDL: Tables, constraints, `stock_on_hand` derived view, RLS policies & RPC validation functions |
| 🌱 [**`db/seed.sql`**](db/seed.sql) | Complete demo dataset with warehouses, sample locations, categorized products & test moves |

---

## 1. The Core Idea (read this before writing any code)

Everything in this app is **one table: `stock_move`**.

A receipt, a delivery, an internal transfer, and an adjustment are *not* four different
features. They are four flavours of the same record:

| Operation | From location | To location |
| --- | --- | --- |
| Receipt | `VENDOR` (virtual) | internal location |
| Delivery | internal location | `CUSTOMER` (virtual) |
| Internal Transfer | internal location | internal location |
| Adjustment | `INVENTORY_LOSS` (virtual) ↔ internal | either direction |

**On-hand stock is never stored. It is derived:**

```sql
quantity_on_hand(product, location) =
    SUM(qty WHERE to_location   = location)
  - SUM(qty WHERE from_location = location)
  -- counting only moves with state = 'done'
```

Get this right and every KPI, filter, ledger view, and low-stock alert falls out for free.
Store a mutable `stock_qty` column on the product instead, and you will spend the last hour
of the hackathon debugging numbers that do not add up. Do not do it.

The second pillar is the **document state machine**, shared by every operation type:

```
Draft → Waiting → Ready → Done
  ↓        ↓        ↓
     Canceled
```

Stock only moves on the transition into `Done` ("Validate"). Nothing before that touches
quantities.

---

## 2. Tech Stack

| Layer | Choice | Why (5-hour reasoning) |
| --- | --- | --- |
| Frontend | React + Vite + Tailwind | Fastest to scaffold, no SSR overhead |
| Backend + DB | Supabase (Postgres) | Auth, **OTP password reset**, and REST API for free |
| Auth | Supabase Auth | OTP reset is a stated requirement — do not hand-roll it |
| Derived stock | Postgres SQL view | One view, zero sync bugs |
| Charts/KPIs | Single aggregate endpoint | One query, not five |
| Deploy | Vercel (FE) + Supabase cloud | Live URL for judging |

Supabase is the single biggest time-saver here: signup, login, and OTP-based password reset
are configuration, not code. That alone buys back roughly an hour.

---

## 3. Data Model

```
profiles            id, name, email, role ('manager' | 'staff')

warehouse           id, name, code
location            id, warehouse_id, name, code,
                    type ('internal' | 'vendor' | 'customer' | 'inventory_loss')

product_category    id, name
product             id, name, sku (unique), category_id, uom,
                    reorder_min, reorder_max

stock_document      id, reference (WH/IN/0001), 
                    type ('receipt' | 'delivery' | 'internal' | 'adjustment'),
                    state ('draft'|'waiting'|'ready'|'done'|'canceled'),
                    partner_name, scheduled_date, warehouse_id, created_by

stock_move          id, document_id, product_id, qty,
                    from_location_id, to_location_id, state, done_at
```

Plus one view that the whole UI reads from:

```sql
CREATE VIEW stock_on_hand AS
SELECT product_id, location_id, SUM(qty) AS qty FROM (
  SELECT product_id, to_location_id   AS location_id,  qty FROM stock_move WHERE state='done'
  UNION ALL
  SELECT product_id, from_location_id AS location_id, -qty FROM stock_move WHERE state='done'
) t
JOIN location l ON l.id = t.location_id AND l.type = 'internal'
GROUP BY product_id, location_id;
```

### Naming convention for references
`WH/IN/0001` receipts · `WH/OUT/0001` deliveries · `WH/INT/0001` transfers · `WH/ADJ/0001`
adjustments. Cheap to generate, and it makes the demo look like a real ERP.

---

## 4. Features → Requirement Mapping

Judges score against the problem statement. This table is the checklist; nothing ships
until its row is green.

| # | Requirement | Where it lives | Priority |
| --- | --- | --- | --- |
| 1 | Signup / login | `/login`, `/signup` | **P0** |
| 2 | OTP-based password reset | `/forgot-password` | **P0** |
| 3 | Redirect to dashboard after auth | route guard | **P0** |
| 4 | Dashboard KPIs (5 cards) | `/dashboard` | **P0** |
| 5 | Filters: doc type, status, warehouse, category | shared filter bar | **P0** |
| 6 | Product CRUD (name, SKU, category, UoM, initial stock) | `/products` | **P0** |
| 7 | Receipts — validate increases stock | `/operations/receipts` | **P0** |
| 8 | Delivery orders — validate decreases stock | `/operations/deliveries` | **P0** |
| 9 | Internal transfers | `/operations/internal` | **P1** |
| 10 | Stock adjustments (counted qty) | `/operations/adjustments` | **P1** |
| 11 | Move history / stock ledger | `/move-history` | **P1** |
| 12 | Stock availability per location | product detail tab | **P1** |
| 13 | Multi-warehouse support | `/settings/warehouses` | **P1** |
| 14 | Low-stock alerts | dashboard + product badge | **P1** |
| 15 | SKU search & smart filters | global search | **P1** |
| 16 | Reordering rules | product form fields | **P2** |
| 17 | Profile menu (My Profile, Logout) | sidebar | **P2** |
| 18 | Pick / Pack sub-steps on delivery | delivery state machine | **P2 — cut first** |

**P0 = demo is dead without it. P1 = expected, build it. P2 = only if the clock allows.**

---

## 5. The 5-Hour Sprint Plan

Three people, parallel tracks, integration checkpoints every hour. Times are elapsed, not
clock time.

### H0:00–0:30 — Sprint 0: Foundation (all three together)
Do **not** split up yet. Thirty minutes of shared setup prevents three hours of merge pain.

- Create Supabase project; run the full schema + `stock_on_hand` view in the SQL editor
- Seed data: 2 warehouses, 6 locations (incl. the 3 virtual ones), 4 categories, 12 products
- Scaffold Vite + React + Tailwind, push to GitHub, connect Vercel
- Agree on the API shape and the sidebar/route names, written down in this README
- **Exit criteria:** everyone can run the app locally and read a product from the database

### H0:30–2:00 — Sprint 1: Vertical Slices

| Owner | Track | Deliverable |
| --- | --- | --- |
| **Sudhanshu** | Data + moves engine | Schema finalized, `validate_document()` transaction, ledger queries, KPI aggregate endpoint |
| **Ayush** | Products + shell | App shell, sidebar, route guards, product list + create/edit, category management |
| **Shubham** | Auth + dashboard | Signup, login, OTP reset flow, 5 KPI cards, shared filter bar component |

**Checkpoint at H1:15:** merge to `main`. If a track is behind, cut its P2 items on the spot.
**Exit criteria at H2:00:** you can log in, see a dashboard, and create a product.

### H2:00–3:30 — Sprint 2: Operations

| Owner | Track | Deliverable |
| --- | --- | --- |
| **Sudhanshu** | Receipts + deliveries | Document form (header + line items), Validate button wired to the moves engine |
| **Ayush** | Transfers + adjustments | Internal transfer form, adjustment form (counted qty → delta move) |
| **Shubham** | Move history + filters | Ledger table, filters by type/status/warehouse/category, SKU search, low-stock badges |

**Checkpoint at H3:00:** merge. The single most important test of the whole hackathon —
receive 100, transfer, deliver 20, adjust −3, then confirm on-hand reads **77** and the
ledger shows four rows.
**Exit criteria at H3:30:** the full inventory flow from the problem statement works end to end.

### H3:30–4:15 — Sprint 3: Polish
- Multi-warehouse switcher, reorder-rule fields, profile menu
- Empty states, loading skeletons, toasts on validate
- Fix only bugs that appear on the demo path; log the rest as known issues
- **Hard freeze at H4:15. No new features after this line, no exceptions.**

### H4:15–5:00 — Sprint 4: Ship
- Deploy and verify the live URL from someone else's machine
- Seed a clean demo dataset (a fresh database is far more convincing than a cluttered one)
- Record the demo video following the script in section 7
- Finish this README: screenshots, live link, honest status table

---

## 6. Scope Discipline (the part that actually decides the outcome)

Five hours means the failure mode is not "we ran out of ideas," it is "we half-built nine
things." Rules:

1. **The ledger is sacred.** If quantities are wrong, nothing else scores. Test it at every
   checkpoint.
2. **Vertical over horizontal.** One operation working end to end beats four forms that
   cannot validate.
3. **Cut in this order:** pick/pack sub-steps → reorder automation → multi-warehouse →
   adjustments. Never cut receipts, deliveries, or the ledger.
4. **No refactors after H3:30.** Ugly and working wins.
5. **State is honest.** Label anything unfinished as *Proposed* or *Not implemented* in this
   README rather than implying it works. Judges catch overclaiming, and it costs more than
   a missing feature.

---

## 7. Demo Script (4 minutes)

Rehearse this once. Follow the problem statement's own example so judges recognize it.

1. **0:00** — Login, OTP reset shown briefly, land on dashboard. Call out the five KPIs.
2. **0:40** — Create product "Steel" (SKU `STL-001`, UoM kg, reorder min 20).
3. **1:10** — Receipt: 100 kg Steel from a vendor → Validate → on-hand **+100**.
4. **1:50** — Internal transfer: Main Store → Production Rack. Total unchanged, location
   updated. *This is the slide that proves the ledger model.*
5. **2:30** — Delivery: 20 kg → Validate → on-hand **80**.
6. **3:00** — Adjustment: 3 kg damaged → on-hand **77**.
7. **3:20** — Move History: four rows, full audit trail. Dashboard KPIs updated live.
8. **3:50** — Low-stock alert fires as stock crosses the reorder minimum.

---

## 8. Getting Started

```bash
git clone <repo-url>
cd stocksense
npm install
cp .env.example .env      # add Supabase URL + anon key
npm run dev
```

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Database setup: run `db/schema.sql` then `db/seed.sql` in the Supabase SQL editor.

---

## 9. Implementation Status

Update honestly before submission. Use exactly these labels:
**Implemented** · **Implemented but not demoed** · **Configured** · **Proposed** · **Not implemented**

| Feature | Status |
| --- | --- |
| Auth + OTP reset | _TBD_ |
| Dashboard KPIs | _TBD_ |
| Product management | _TBD_ |
| Receipts | _TBD_ |
| Delivery orders | _TBD_ |
| Internal transfers | _TBD_ |
| Stock adjustments | _TBD_ |
| Move history / ledger | _TBD_ |
| Multi-warehouse | _TBD_ |
| Low-stock alerts | _TBD_ |
| Reordering rules | _TBD_ |

---

## 10. Known Limitations

State these plainly rather than letting judges discover them:

- Built in a 5-hour window; scope was deliberately limited to the documented core flow
- No unit/serial/lot tracking, no costing or valuation layer
- Pick/pack modeled as a single Validate step rather than separate sub-operations
- Reordering rules surface alerts only; they do not auto-generate purchase documents
- Single-tenant; no granular role-based permissions beyond manager/staff

---

**Problem statement:** StockSense — Odoo Hackathon
**Mockup reference:** https://link.excalidraw.com/l/65VNwvy7c4X/3ENvQFu9o8R