────────────────────────────────────────
SOFTWARE REQUIREMENT SPECIFICATION (SRS)
Project codename: SolFin
────────────────────────────────────────

VERSION
0.1-draft (2024-07-28)

1. PURPOSE & SCOPE
SolFin is a personal & family finance planner that runs as a cross-platform application (Android, iOS, and Web PWA).
It works fully offline first, with optional sync to a backend when the user chooses to log in.  
When logged in, the app can scan receipts with Google Gemini-Flash and automatically create transactions.  
All offline data is queued and transparently syncs when connectivity returns.

2. FUNCTIONAL REQUIREMENTS (FR)

FR-1  Accounts  
   CRUD.  Each account has currency, type (cash, savings, credit, loan, crypto…), initial balance.

FR-2  Pouches  
   CRUD.  A pouch is an envelope/budget bucket (e.g. “Groceries”).  
   - Can be private or Shared (real-time, multi-user).  
   - Shared pouches have roles: Owner / Editor / Viewer.

FR-3  Transactions  
   CRUD.  Core fields: id, amount, currency, date-time, description, category, tags, GPS, images, pouch, account.  
   - Expense (-) or Income (+).  
   - Split across multiple pouches.  
   - Mark as recurring (weekly, monthly, etc.).  
   - Soft delete & undelete.

FR-4  Transfers  
   CRUD.  Moves money between two accounts or pouches; creates a pair of linked transactions.

FR-5  Recurring Income (Salary)  
   User sets amount, account, schedule → app auto-creates income transaction.

FR-6  Asset vs Plain Spend  
   Toggle “Is Asset” on any transaction.  
   Assets are summed separately; depreciation schedule optional.

FR-7  Goal-based Savings  
   Create goal: title, target amount, target date, linked pouch.  
   App calculates required monthly contribution and shows progress bar + alerts if behind.

FR-8  Bill Calendar  
   Visual calendar with color dots for all upcoming recurring bills.  
   Tap to pay or mark paid → creates transaction.

FR-9  Spending Heat-map  
   Transactions have GPS; world map clusters spend by city & shows totals.

FR-10 Voice Entry (offline)  
   Speech-to-text locally: “Coffee five bucks” → draft transaction ($5, uncategorized).

FR-11 Receipt Scanning (backend mode)  
   - Camera scans multiple receipts in one batch.  
   - Gemini-Flash returns JSON array:  
     [{  
        "vendor":"Starbucks",  
        "amount":4.75,  
        "currency":"USD",  
        "date":"2024-07-28",  
        "category":"Coffee",  
        "items":["Latte"],  
        "imageHash":"sha256-of-image"  
     }, …]  
   - App stores imageHash to avoid duplicate scans.  
   - Works offline → queue scan job → sync when online.

FR-12 Offline First & Conflict Resolution  
   - All writes stored in local SQLite.  
   - Sync layer pushes changes to backend; pulls server changes; automatic merge strategy (LWW + user override prompt).

FR-13 Auth Modes  
   - Stand-alone: no login, data stays on device.  
   - Logged-in: email, Google, Apple SSO.  
   - Easy export/import to migrate between modes.

3. NON-FUNCTIONAL REQUIREMENTS

NFR-1  Cross-platform
   Ionic React → Capacitor (unified build for Android, iOS, and Web PWA).

NFR-2  Database Abstraction  
   All persistence must go through DatabaseManager (see §5).  
   Must allow swap between: SQLite (local), MySQL, PostgreSQL, MongoDB, JSON flat-file.

NFR-3  Security  
   - Device-level encryption for local DB.  
   - HTTPS/TLS for backend.  
   - JWT access + refresh tokens.  
   - End-to-end encryption for shared pouches (optional phase-2).

NFR-4  Performance  
   - Startup < 2 s on mid-range Android.  
   - Offline search through 5 years of data < 500 ms.

NFR-5  Accessibility  
   WCAG 2.1 AA compliance.

4. HIGH-LEVEL ARCHITECTURE

┌────────────────────────────┐
│  Ionic React (Unified App) │
│  Capacitor plugins         │
│  Local SQLite (Watermelon) │
└──────────┬─────────────────┘
           │ Sync / REST
┌──────────┴─────────────────┐
│  Backend API (Node)        │
│  Repository Pattern        │
│  Gemini-Flash Service      │
└──────────┬─────────────────┘
           │ HTTP/REST
┌──────────┴─────────────────┐
│  SolFin Database Service   │
│  Sharded SQLite Cluster    │
│  Load Balancer             │
│  Read/Write Separation     │
└────────────────────────────┘

5. DATABASE MANAGER SPEC

Package: @solfin/data  
Language: TypeScript (shared between frontend & backend)

Interfaces
interface IDatabaseManager {
  // CRUD generic
  create<T>(table: string, data: Partial<T>): Promise<string>;
  read<T>(table: string, id: string): Promise<T | null>;
  update<T>(table: string, id: string, data: Partial<T>): Promise<void>;
  delete(table: string, id: string): Promise<void>;
  query<T>(table: string, filters: Filter): Promise<T[]>;

  // Special
  beginTx(): Promise<ITransaction>;
  migrate(schemaVersion: number): Promise<void>;
  dump(): Promise<Buffer>; // export
  restore(buf: Buffer): Promise<void>;
}

Implementations
- SqliteManager (local)
- PostgresManager
- MysqlManager
- MongoManager
- JsonFileManager (for dev/tests)

Usage rule  
Any service layer that needs DB access must accept an instance of IDatabaseManager via dependency injection.

6. FOLDER STRUCTURE (Monorepo)

solfin/
├── backend/
│   ├── api/              # NestJS or Express
├── solfin_database/
│   ├── shards/           # Multiple SQLite databases
│   ├── load-balancer/    # Read/Write distribution
│   ├── api/              # Database service API
│   └── ai-service/       # Gemini-Flash wrapper
├── docs/                 # ← start here
│   ├── README.md
│   ├── user-guide.md
│   ├── dev-setup.md
│   └── api-spec.md
└── scripts/

7. INITIAL DOCUMENTATION FILES (to be created)

docs/
├── 00-overview.md            (this SRS)
├── 01-user-guide/
│   ├── quick-start.md
│   ├── accounts.md
│   ├── pouches.md
│   ├── goals.md
│   ├── receipt-scan.md
│   └── offline-mode.md
├── 02-dev-guide/
│   ├── setup.md
│   ├── db-manager.md
│   ├── ionic-cordova-tips.md
   └── gemini-prompt.md        (prompt engineering)
└── 03-api/
   ├── openapi.yaml
   └── sync-protocol.md

8. GEMINI-FLASH PROMPT TEMPLATE (stored in docs/02-dev-guide/gemini-prompt.md)

System prompt:
You are a receipt OCR assistant.  
Return ONLY a JSON array with no extra text.  
Keys: vendor, amount, currency, date (YYYY-MM-DD), category, items (array of strings), imageHash (sha256).

User prompt:
[IMAGE_BASE64]

9. ROADMAP

MVP (4 weeks)
- Accounts, Pouches, Transactions, Transfers, Offline DB, Ionic build.

Phase-2 (4 weeks)
- Auth, Backend sync, Goal-based savings, Bill calendar.

Phase-3 (4 weeks)
- Shared pouches, receipt scan, heat-map, voice entry.
(allowance, warn on FX fees.