# SolFin Frontend Technical Document

This document provides a detailed technical overview of the SolFin frontend application, built with Ionic React.

## 1. Overview

The SolFin frontend is a cross-platform application (Android, iOS, and Web PWA) developed using Ionic React. It serves as the user interface (UI) and user experience (UX) layer of the SolFin financial planning application. It is designed to be offline-first, with optional synchronization to a backend API when the user chooses to log in.

## 2. Architecture and Technologies

*   **Framework:** Ionic React
*   **Cross-Platform:** Capacitor (unified build for Android, iOS, and Web PWA)
*   **Local Database:** WatermelonDB (SQLite-based, for offline data storage)
*   **Communication:** RESTful APIs for communication with the Node.js backend.

## 3. Functional Requirements (FR) - Frontend Perspective

The frontend implements the user-facing aspects of the following functional requirements:

*   **FR-1 Accounts:** Provides UI for CRUD operations on accounts (currency, type, initial balance).
*   **FR-2 Pouches:** Provides UI for CRUD operations on pouches (envelope/budget buckets), including private and shared (real-time, multi-user) pouches with role management (Owner/Editor/Viewer).
*   **FR-3 Transactions:** Offers UI for CRUD operations on transactions (amount, currency, date-time, description, category, tags, GPS, images, pouch, account). Supports expense/income, split across multiple pouches, recurring transactions, soft delete/undelete.
*   **FR-4 Transfers:** Enables UI for CRUD operations to move money between accounts or pouches, creating linked transactions.
*   **FR-5 Recurring Income (Salary):** User sets amount, account, schedule, and the app auto-creates income transactions. The frontend provides the interface for this.
*   **FR-6 Asset vs Plain Spend:** UI to toggle "Is Asset" on any transaction; assets are summed separately.
*   **FR-7 Goal-based Savings:** UI to create goals (title, target amount, target date, linked pouch) and visualize progress.
*   **FR-8 Bill Calendar:** Visual calendar UI with color dots for upcoming recurring bills, with tap-to-pay/mark-paid functionality.
*   **FR-9 Spending Heat-map:** (Partially implemented) UI to display transactions with GPS data on a world map, clustering spend by city.
*   **FR-10 Voice Entry (offline):** (Not yet implemented) Frontend will integrate speech-to-text for drafting transactions.
*   **FR-11 Receipt Scanning (backend mode):** (Partially implemented) Frontend will provide camera access to scan receipts and queue jobs for backend processing.
*   **FR-12 Offline First & Conflict Resolution:** Frontend handles local SQLite storage and initiates sync with the backend, managing merge strategies.
*   **FR-13 Auth Modes:** Frontend provides UI for stand-alone mode, logged-in modes (email, Google, Apple SSO), and export/import functionality.

## 4. Non-Functional Requirements (NFR) - Frontend Responsibility

*   **NFR-1 Cross-platform:** Achieved through Ionic React and Capacitor for unified builds.
*   **NFR-2 Database Abstraction:** Frontend interacts with local WatermelonDB through its abstractions.
*   **NFR-3 Security:** Device-level encryption for local DB (handled by underlying platform/WatermelonDB). JWT token handling for backend communication.
*   **NFR-4 Performance:** Optimized for fast startup (< 2s on mid-range Android) and quick offline search (< 500ms).
*   **NFR-5 Accessibility:** Aims for WCAG 2.1 AA compliance.

## 5. Development Status (as per PROJECT-STATUS.md)

*   **Architecture Implementation:** Frontend (Ionic React) architecture is ready.
*   **Partially Implemented:**
    *   Frontend (Ionic React): UI implementation is needed.
    *   Authentication: Basic implementation exists, needs JWT and proper security integration.
    *   Receipt Scanning: Backend structure is ready, Gemini integration is needed.
    *   Offline Sync: Architecture supports it, sync logic needs implementation.
*   **Not Yet Implemented:**
    *   Frontend UI Components: Ionic React components need to be built.
    *   Mobile App Build: Capacitor configuration and mobile builds.
    *   Real-time Features: WebSocket implementation for live updates.

## 6. Next Steps for Frontend Development

As per `PROJECT-STATUS.md`, the next steps include:

1.  Create Ionic React components for each feature.
2.  Implement routing and navigation.
3.  Connect to backend APIs using HTTP client.
4.  Add offline storage using Capacitor Storage.
5.  Implement sync logic for offline-first functionality.
6.  Add mobile-specific features (camera, GPS, etc.).

## 7. Frontend Folder Structure

The frontend application is organized under the `frontend/` directory. Key sub-directories include:

*   `frontend/public/`: Static assets like images, icons, and data files.
    *   `frontend/public/assets/`: Contains various assets.
        *   `frontend/public/assets/data/`: Sample data in JSON format.
        *   `frontend/public/assets/icon/`: Application icons.
        *   `frontend/public/assets/img/`: Images used in the application.
    *   `frontend/public/index.html`: The main HTML entry point.
*   `frontend/src/`: Contains the main source code for the Ionic React application.
    *   `frontend/src/api/`: API service integrations.
        *   **`frontend/src/api/backendApi.ts`**: Centralized module for making HTTP requests to the SolFin Backend API.
            *   **Purpose**: Encapsulates API call logic, request/response transformations, and error handling for all interactions with the backend. This promotes reusability, consistency, and simplifies error management.
            *   **Key Functions/Methods**:
                *   `request(method: string, url: string, data?: any)`: A generic asynchronous function to perform HTTP requests.
                    *   **Logic/Pseudocode**:
                        ```
                        FUNCTION request(method, url, data):
                            // 1. Construct URL with query parameters for GET requests
                            IF method is "GET" and data exists:
                                queryParams = encode_data_to_query_string(data)
                                fullUrl = backend_api_base_url + url + "?" + queryParams
                            ELSE:
                                fullUrl = backend_api_base_url + url
                            
                            // 2. Prepare request options
                            options = {
                                method: method,
                                headers: {
                                    'Content-Type': 'application/json',
                                    // Add Authorization header with JWT token if available (from local storage/state)
                                    // token = get_jwt_token_from_storage()
                                    // IF token: headers['Authorization'] = `Bearer ${token}`
                                }
                            }
                            IF data and method is NOT "GET": // Body for non-GET requests
                                options.body = JSON.stringify(data)
                            
                            // 3. Execute fetch request
                            response = await fetch(fullUrl, options)
                            
                            // 4. Handle response status
                            IF response.status is BETWEEN 200 and 299:
                                IF response.status is 204: // No Content
                                    RETURN null
                                ELSE:
                                    RETURN await response.json()
                            ELSE:
                                // Handle API errors (e.g., 400, 401, 403, 404, 500)
                                error_data = await response.json() // Assuming backend sends JSON errors
                                THROW new Error(error_data.message || `API Error: ${response.status}`)
                        END FUNCTION
                        ```
                *   `getAccounts(userId: string)`: Fetches user accounts from `/accounts`.
                    *   **Logic/Pseudocode**:
                        ```
                        FUNCTION getAccounts(userId):
                            RETURN request("GET", "/accounts", { user_id: userId })
                        END FUNCTION
                        ```
                *   `createAccount(accountData: Account)`: Sends a POST request to `/accounts` to create a new account.
                    *   **Logic/Pseudocode**:
                        ```
                        FUNCTION createAccount(accountData):
                            RETURN request("POST", "/accounts", accountData)
                        END FUNCTION
                        ```
                *   `getTransactions(userId: string)`: Fetches user transactions from `/transactions`.
                    *   **Logic/Pseudocode**:
                        ```
                        FUNCTION getTransactions(userId):
                            RETURN request("GET", "/transactions", { user_id: userId })
                        END FUNCTION
                        ```
                *   `createTransaction(transactionData: Transaction)`: Sends a POST request to `/transactions`.
                    *   **Logic/Pseudocode**:
                        ```
                        FUNCTION createTransaction(transactionData):
                            RETURN request("POST", "/transactions", transactionData)
                        END FUNCTION
                        ```
                *   `createTransactionWithSplits(data: { transaction: Transaction, splits: TransactionSplit[] })`: Sends a POST request to `/transactions/with-splits`.
                    *   **Logic/Pseudocode**:
                        ```
                        FUNCTION createTransactionWithSplits(data):
                            RETURN request("POST", "/transactions/with-splits", data)
                        END FUNCTION
                        ```
                *   `getPouches(userId: string)`: Fetches user pouches from `/pouches`.
                    *   **Logic/Pseudocode**:
                        ```
                        FUNCTION getPouches(userId):
                            RETURN request("GET", "/pouches", { user_id: userId })
                        END FUNCTION
                        ```
                *   `createPouch(pouchData: Pouch)`: Sends a POST request to `/pouches`.
                    *   **Logic/Pseudocode**:
                        ```
                        FUNCTION createPouch(pouchData):
                            RETURN request("POST", "/pouches", pouchData)
                        END FUNCTION
                        ```
            *   **Flow Diagram (Mermaid)**:
                ```mermaid
                graph TD
                    A[UI Component Action (e.g., Save Account)] --> B(Call backendApi.createAccount);
                    B -- Account Data --> C{backendApi.request};
                    C -- HTTP POST /accounts --> D[Backend API];
                    D -- HTTP Response (201 Created / Error) --> C;
                    C --> E{Handle Response/Error};
                    E -- Success/Error --> F[Update Frontend State/Show Notification];
                ```
    *   `frontend/src/components/`: Reusable UI components.
        *   **Purpose**: Encapsulate specific UI functionalities and presentational logic. These components receive data via props and emit events. They are designed for reususability and maintainability.
        *   **Key Constructs**: React functional components, Ionic UI components (`IonButton`, `IonInput`, `IonCard`, `IonList`), state management hooks (`useState`, `useEffect`, `useContext`), event handlers (`onClick`, `onChange`).
        *   **Examples**:
            *   `AccountCard.tsx`: Displays a summary of an individual financial account.
            *   `TransactionForm.tsx`: Provides input fields for creating or editing a transaction.
            *   `PouchListItem.tsx`: Represents a single budget pouch in a list.
    *   `frontend/src/data/`: Contains data management logic, including Redux state, actions, reducers, and data fetching utilities.
        *   **Purpose**: Manages the application's global state using Redux Toolkit, ensuring a predictable and centralized state container. This layer abstracts data fetching and manipulation from UI components.
        *   **Key Constructs**: Redux Toolkit `createSlice()`, `configureStore()`, `createAsyncThunk()`, `combineReducers()`, selectors (`createSelector`).
        *   **Examples**:
            *   `frontend/src/data/user/userSlice.ts`: Manages user authentication state.
                *   **Purpose**: Centralized management of user-related state and actions (login, logout, profile updates, session management).
                *   **Key Constructs**:
                    *   `userSlice = createSlice({ name: 'user', initialState: {...}, reducers: {...}, extraReducers: {...} })`: Defines initial state (`isLoggedIn`, `userData`, `jwtToken`), synchronous reducers (e.g., `setLogin`, `setLogout`), and `extraReducers` for handling asynchronous actions dispatched by `createAsyncThunk`.
                    *   `loginUser = createAsyncThunk('user/login', async (credentials, { dispatch }) => {...})`: An asynchronous thunk for user login.
                        *   **Logic/Pseudocode**:
                            ```
                            ASYNC FUNCTION loginUser(credentials):
                                TRY:
                                    response = await backendApi.login(credentials.email, credentials.password)
                                    // Store JWT token securely (e.g., Capacitor Preferences, HttpOnly cookies)
                                    // dispatch(userSlice.actions.setLogin(response.user_data))
                                    RETURN response.user_data // Includes JWT token
                                CATCH error:
                                    // Handle login error, dispatch error action
                                    THROW error
                            END FUNCTION
                            ```
                    *   `selectIsLoggedIn(state)`: A Redux selector to efficiently retrieve the user's login status from the store.
            *   `frontend/src/data/accounts/accountsSlice.ts`: Manages financial accounts state.
                *   **Purpose**: Handles loading, adding, updating, and deleting user accounts.
                *   **Key Constructs**: `createSlice()`, `createAsyncThunk()` for fetching/mutating accounts via `backendApi.ts`.
    *   `frontend/src/models/`: TypeScript interfaces and data models.
        *   **Purpose**: Define the canonical shape of data objects exchanged within the application and with the backend API. This ensures strong typing and consistency across the frontend.
        *   **Key Constructs**: `interface User { id: string; email: string; name?: string; preferences?: object; }`, `interface Account { id: string; userId: string; name: string; currency: string; type: string; initialBalance: number; currentBalance: number; }`, `interface Transaction { id: string; userId: string; accountId: string; amount: number; currency: string; dateTime: number; description?: string; category?: string; tags?: string[]; gpsLatitude?: number; gpsLongitude?: number; imageHash?: string; isExpense: boolean; isRecurring: boolean; isAsset: boolean; originalTransactionId?: string; }`.
    *   `frontend/src/pages/`: Contains the main page components of the application, often corresponding to specific routes.
        *   **Purpose**: Serve as containers for UI components, orchestrating data flow between the Redux store (via selectors and dispatching actions) and the presentation layer.
        *   **Key Constructs**: React functional components, Ionic layout components (`IonPage`, `IonHeader`, `IonToolbar`, `IonTitle`, `IonContent`, `IonFab`), routing integration (`useIonRouter`, `useParams`).
        *   **Examples**:
            *   `LoginPage.tsx`: Handles user authentication UI and dispatches `loginUser` action.
            *   `DashboardPage.tsx`: Displays an overview of financial data, fetching data via Redux actions.
            *   `AccountDetailsPage.tsx`: Allows users to view, create, or edit a specific account.
    *   `frontend/src/theme/`: Styling and theming files.
        *   **Purpose**: Centralize application-wide styling definitions, including global CSS variables, color palettes, typography, and responsiveness rules.
        *   **Key Constructs**: CSS variables (`--ion-color-primary`, `--ion-background-color`), global styles defined in `variables.css` and `app.scss`.
    *   `frontend/src/types/`: Custom TypeScript type definitions.
        *   **Purpose**: Store custom or extended TypeScript type declarations not directly related to data models. This includes types for environment variables, utility types, or global declarations for third-party modules.
        *   **Key Constructs**: `declare module '*.png';`, `type DeepPartial<T> = { ... };`.
    *   `frontend/src/util/` and `frontend/src/utils/`: Utility functions and helpers.
        *   **Purpose**: Provide generic, reusable helper functions that don't belong to specific components or data layers. These often include pure functions that perform common tasks.
        *   **Key Functions/Methods**:
            *   `formatDate(timestamp: number): string`: Formats a Unix timestamp into a readable date string.
            *   `getTimestamp(): number`: Returns the current Unix timestamp.
            *   `logger.ts`: Centralized logging utility (`log`, `warn`, `error`).
    *   `frontend/src/main.tsx`: Main application entry point for React.
        *   **Purpose**: Initializes the React application, sets up global providers (e.g., Redux store, Ionic React router), and renders the root component (`App.tsx`) into the DOM.
        *   **Key Constructs**: `ReactDOM.createRoot()`, `root.render()`, `Provider` (from `react-redux` for the Redux store), `IonReactRouter`.
*   `frontend/android/`: Android-specific project files (generated by Capacitor).
*   `frontend/ios/`: iOS-specific project files (generated by Capacitor).
*   `frontend/capacitor.config.json`: Capacitor configuration file.
*   `frontend/ionic.config.json`: Ionic CLI configuration file.
*   `frontend/package.json`: Project dependencies and scripts.
*   `frontend/Dockerfile`: Dockerfile for containerizing the frontend application.