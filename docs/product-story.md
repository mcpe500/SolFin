# SolFin Product Story: End-to-End User Journey

This document outlines the complete user journey through the SolFin application, from initial setup to daily use, detailing the interactions between the frontend, backend, and database services at each step.

## 1. User Onboarding and Initial Setup

### 1.1. First Launch (Offline Mode)
*   **User Action**: User launches SolFin app for the first time on their mobile device or web browser.
*   **Frontend Interaction**:
    *   `main.tsx` initializes the Ionic React application.
    *   `App.tsx` checks for existing user session or local data.
    *   `HomeOrTutorial.tsx` component determines if it's a first-time user.
    *   `Tutorial.tsx` is displayed, guiding the user through initial features and concepts.
    *   `Login.tsx` or `Signup.tsx` is presented with options for "Stand-alone" (offline-only) or "Logged-in" modes.
*   **Backend/Database Interaction**: None initially. All operations are local.
*   **Local Data**: WatermelonDB is initialized on the device to store local user preferences and potentially a demo account/pouch for immediate use.

### 1.2. Creating a Stand-alone Account
*   **User Action**: User selects "Stand-alone" mode and creates a local profile.
*   **Frontend Interaction**:
    *   User inputs basic profile information (e.g., name, currency preference) via `Account.tsx` or a dedicated setup form.
    *   Data is saved to local WatermelonDB.
*   **Backend/Database Interaction**: None.

### 1.3. User Registration (Logged-in Mode)
*   **User Action**: User chooses to "Sign Up" with email/password or SSO (Google/Apple).
*   **Frontend Interaction**:
    *   `Signup.tsx` captures user credentials.
    *   `backendApi.ts`'s `request()` function is called, sending `POST /users/register` to the Backend API.
        *   **Request**: `{ email, password }`
*   **Backend Interaction**:
    *   `backend/routes/userRoutes.js` receives the request and forwards it to `UserController.register()`.
    *   `UserController.register()`:
        *   Calls `ValidationHelper.validateUserData()` to ensure valid email/password format.
        *   Calls `UserService.registerUser()`.
    *   `UserService.registerUser()`:
        *   Hashes the password using `AuthHelper.hashPassword()`.
        *   Calls `DatabaseRepository.create("users", { email, hashedPassword, ... })`.
*   **Database Service Interaction**:
    *   `solfin_database/server.js` receives `POST /users` from Backend API.
    *   `solfin_database/lib/DatabaseService.js`'s `create()` method is invoked.
    *   `solfin_database/lib/ShardManager.js` routes the request to `users.db`.
    *   New user record is inserted into `users.db`.
*   **Response Flow**: Database Service -> Backend API (201 Created with user ID) -> Frontend (`Signup.tsx` redirects to `DashboardPage.tsx` or `Login.tsx`).

## 2. Daily Financial Management

### 2.1. Adding a New Account
*   **User Action**: User navigates to "Accounts" section and clicks "Add New Account".
*   **Frontend Interaction**:
    *   `Account.tsx` (or a dedicated form component) is rendered.
    *   User inputs account details (name, currency, type, initial balance).
    *   `backendApi.ts`'s `createAccount()` is called, sending `POST /accounts` to the Backend API.
        *   **Request**: `{ name, currency, type, initialBalance, userId }` (userId added by frontend or derived by backend).
*   **Backend Interaction**:
    *   `backend/routes/accountRoutes.js` receives the request and forwards to `AccountController.createAccount()`.
    *   `AccountController.createAccount()`:
        *   Calls `ValidationHelper.validateAccountData()`.
        *   Assigns `request.user.id` to `accountData.userId`.
        *   Calls `DatabaseRepository.create("accounts", accountData)`.
*   **Database Service Interaction**:
    *   `solfin_database/server.js` receives `POST /accounts`.
    *   `solfin_database/lib/DatabaseService.js`'s `create()` method is invoked.
    *   `solfin_database/lib/ShardManager.js` routes to `accounts.db`.
    *   New account record is inserted.
*   **Response Flow**: Database Service -> Backend API (201 Created with new account) -> Frontend (`Account.tsx` updates UI, potentially navigates back to account list).

### 2.2. Recording a Transaction (with Splits)
*   **User Action**: User records an expense, splitting it across "Groceries" and "Entertainment" pouches.
*   **Frontend Interaction**:
    *   `TransactionForm.tsx` (or similar) is displayed.
    *   User inputs transaction details (amount, description, category, account) and defines splits for different pouches.
    *   `backendApi.ts`'s `createTransactionWithSplits()` is called, sending `POST /transactions/with-splits` to the Backend API.
        *   **Request**: `{ transactionData: { amount, currency, date, ... }, splits: [{ pouchId, amount }, ...] }`
*   **Backend Interaction**:
    *   `backend/routes/transactionRoutes.js` receives the request and forwards to `TransactionController.createTransactionWithSplits()`.
    *   `TransactionController.createTransactionWithSplits()`:
        *   Validates transaction and split data using `ValidationHelper`.
        *   Calls `DatabaseRepository.create("transactions", transactionData)`.
        *   Calls `DatabaseRepository.create("transaction_splits", splitData)` for each split.
*   **Database Service Interaction**:
    *   `solfin_database/server.js` receives requests for `transactions` and `transaction_splits`.
    *   `solfin_database/lib/DatabaseService.js` handles routing to `transactions.db` and `pouches.db` (for pouch validation/updates).
*   **Response Flow**: Database Service -> Backend API (201 Created) -> Frontend (updates transaction list, possibly pouch balances).

### 2.3. Viewing Spending Heat-map
*   **User Action**: User navigates to the "Spending Heat-map" feature.
*   **Frontend Interaction**:
    *   `MapView.tsx` is rendered.
    *   Map component requests transaction data with GPS coordinates.
    *   `backendApi.ts`'s `getTransactions()` is called, sending `GET /transactions?user_id={id}` to the Backend API (with optional date/category filters).
*   **Backend Interaction**:
    *   `backend/routes/transactionRoutes.js` receives the request and forwards to `TransactionController.getTransactions()`.
    *   `TransactionController.getTransactions()`:
        *   Calls `DatabaseRepository.query("transactions", { userId, ...filters })`.
*   **Database Service Interaction**:
    *   `solfin_database/server.js` receives `POST /transactions/query`.
    *   `solfin_database/lib/DatabaseService.js` queries `transactions.db`.
*   **Response Flow**: Database Service -> Backend API (200 OK with transaction list) -> Frontend (`MapView.tsx` renders data on map).

## 3. Advanced Features and Synchronization

### 3.1. Offline Data Sync
*   **User Action**: User is offline, records transactions, then comes online.
*   **Frontend Interaction**:
    *   All writes are initially saved to local WatermelonDB.
    *   When connectivity is detected, the frontend's sync logic (within `frontend/src/data/dataApi.ts` or a dedicated sync service) activates.
    *   The sync layer pushes local changes to the Backend API (`POST /sync` or individual CRUD operations).
    *   The sync layer pulls server changes from the Backend API (`GET /sync` or individual GET operations).
    *   Conflict resolution (LWW + user override) is handled client-side by WatermelonDB or custom logic.
*   **Backend Interaction**:
    *   Receives batched or individual data updates/queries.
    *   Processes them through respective controllers and services, interacting with the Database Service.
*   **Database Service Interaction**: Processes data as usual.

### 3.2. Receipt Scanning (Backend Mode)
*   **User Action**: User takes a picture of a receipt using the app's camera.
*   **Frontend Interaction**:
    *   Camera component (Capacitor plugin) captures image.
    *   Image is converted to Base64.
    *   `backendApi.ts` sends `POST /receipt-scan` (or similar) to the Backend API.
        *   **Request**: `{ imageBase64: '...', userId: '...', imageHash: 'sha256_of_image' }`
*   **Backend Interaction**:
    *   Receives the image data.
    *   Sends the image to Google Gemini-Flash service (via `solfin_database/ai-service`).
    *   Receives parsed JSON data from Gemini-Flash.
    *   Processes and validates the parsed transaction data.
    *   Calls `DatabaseRepository.create("transactions", parsedTransactionData)`.
*   **Database Service Interaction**: Saves the new transaction.
*   **Response Flow**: Backend API (201 Created with transaction details) -> Frontend (displays draft transaction for user review).

## 4. Overall Flow Diagram (High-Level)

```mermaid
graph TD
    subgraph Frontend (Ionic React App)
        A[User Interaction] --> B(UI Components);
        B --> C{State Management / Data Logic};
        C -- API Calls --> D[backendApi.ts];
        C -- Local Persistence --> E(WatermelonDB);
        E -- Sync Trigger --> D;
    end

    subgraph Backend (Node.js API)
        D -- HTTP/REST --> F[Fastify Routes];
        F --> G{Controllers};
        G --> H{Services};
        H --> I[Repositories];
        I -- HTTP/REST --> J[SolFin Database Service API];
    end

    subgraph Database Service (Sharded SQLite Cluster)
        J --> K[Database Service Logic];
        K --> L[Shard Manager];
        L -- Read/Write --> M[SQLite Shards (users.db, accounts.db, etc.)];
    end

    subgraph External Services
        H --> N(Google Gemini-Flash API);
        N -- Parsed Data --> H;
    end

    M -- Data Retrieval --> L;
    L --> K;
    K --> J;

    I -- Data Retrieval --> J;
    J --> I;
    H -- Data Processing --> G;
    G --> F;
    F --> D;

    D -- Rendered UI / Status --> A;