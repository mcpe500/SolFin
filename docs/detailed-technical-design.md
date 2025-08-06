# SolFin Detailed Technical Design

This document provides a comprehensive, file-level technical design of the SolFin project, detailing the purpose of each file and the key functions, modules, classes, and methods within them. It aims to provide a granular understanding of the project's codebase.

## 1. Introduction

The SolFin project is structured as a monorepo with a three-tier microservices architecture: a Frontend (Ionic React), a Backend API (Node.js/Fastify), and a dedicated SolFin Database Service (Sharded SQLite). This document serves as a detailed blueprint, mapping out the folder structure and the internal components of each service.

## 2. Frontend Detailed Design (`frontend/`)

The `frontend/` directory houses the Ionic React application, responsible for the user interface and experience across web, Android, and iOS platforms.

### Core Files and Directories:

*   **`frontend/src/App.scss`**:
    *   **Purpose**: Contains global and component-specific SCSS styling for the main application. Defines visual themes, layouts, and responsiveness rules.
    *   **Key Constructs**: CSS classes, variables, mixins.
*   **`frontend/src/App.test.tsx`**:
    *   **Purpose**: Contains unit tests for the main `App` React component. Ensures core application rendering and initial logic function as expected.
    *   **Key Constructs**: Jest test suites (`describe`), individual tests (`test`, `it`), rendering utilities (`render`), assertion methods (`expect`).
*   **`frontend/src/App.tsx`**:
    *   **Purpose**: The root React component of the application. It typically handles top-level routing, global state management integration, and the overall layout structure (e.g., IonRouterOutlet, IonReactRouter).
    *   **Key Constructs**: React functional components, `IonReactRouter`, `IonRouterOutlet`, state hooks (`useState`, `useEffect`), context consumers.
*   **`frontend/src/declarations.ts`**:
    *   **Purpose**: TypeScript declaration file for various modules or global types that might not have built-in type definitions, or for extending existing types.
*   **`frontend/src/main.tsx`**:
    *   **Purpose**: The primary entry point for the Ionic React application. It's responsible for rendering the root `App` component into the DOM.
    *   **Key Constructs**: `ReactDOM.createRoot()`, `root.render()`, `StrictMode`.
*   **`frontend/src/react-app-env.d.ts`**:
    *   **Purpose**: References `react-scripts` types, ensuring TypeScript understands environment variables and other specifics of a Create React App project (even if Ionic/Capacitor is layered on top).
*   **`frontend/src/serviceWorker.ts`**:
    *   **Purpose**: Registers a service worker to enable Progressive Web App (PWA) features such as offline capabilities and push notifications.
    *   **Key Constructs**: `register()`, `unregister()`, event listeners (`onload`), `console.log` for service worker status.
*   **`frontend/src/store.ts`**:
    *   **Purpose**: Configures and exports the Redux store for centralized state management. Integrates Redux Toolkit slices, middleware, and enhancers.
    *   **Key Constructs**: `configureStore()` from `@reduxjs/toolkit`, `combineReducers()`, middleware setup.
*   **`frontend/src/vite-env.d.ts`**:
    *   **Purpose**: Provides TypeScript type definitions specific to the Vite build tool, such as `import.meta.env` for environment variables.
*   **`frontend/src/__snapshots__/`**:
    *   **Purpose**: Directory for Jest snapshot test files. These files store the rendered output of components for comparison in subsequent test runs.
    *   **Key Files**: `App.test.tsx.snap` (snapshot for the `App` component).
*   **`frontend/src/api/`**:
    *   **`frontend/src/api/backendApi.ts`**:
        *   **Purpose**: Centralized module for making HTTP requests to the SolFin Backend API. Encapsulates API call logic, request/response transformations, and error handling.
        *   **Key Functions/Methods**:
            *   `request(method, url, data)`: A generic function to perform HTTP requests (e.g., using `fetch` or `axios`).
            *   `getAccounts(userId)`: Fetches user accounts from `/accounts`.
            *   `createAccount(accountData)`: Sends a POST request to `/accounts` to create a new account.
            *   `updateAccount(accountId, updates)`: Sends a PUT request to `/accounts/:id` to update an account.
            *   `deleteAccount(accountId)`: Sends a DELETE request to `/accounts/:id` to delete an account.
            *   `getTransactions(userId)`: Fetches user transactions from `/transactions`.
            *   `createTransaction(transactionData)`: Sends a POST request to `/transactions`.
            *   `createTransactionWithSplits(data)`: Sends a POST request to `/transactions/with-splits`.
            *   `updateTransaction(transactionId, updates)`: Sends a PUT request to `/transactions/:id`.
            *   `deleteTransaction(transactionId)`: Sends a DELETE request to `/transactions/:id`.
            *   `getPouches(userId)`: Fetches user pouches from `/pouches`.
            *   `createPouch(pouchData)`: Sends a POST request to `/pouches`.
            *   `updatePouch(pouchId, updates)`: Sends a PUT request to `/pouches/:id`.
            *   `deletePouch(pouchId)`: Sends a DELETE request to `/pouches/:id`.
            *   `runMigrations()`: Calls `POST /admin/migrate` (admin endpoint).
            *   `runSeeders()`: Calls `POST /admin/seed` (admin endpoint).
            *   `checkHealth()`: Calls `GET /admin/health` (admin endpoint).
            *   `setupDatabase()`: Calls `POST /admin/setup` (admin endpoint).
*   **`frontend/src/components/`**: Reusable UI components used throughout the application.
    *   **`frontend/src/components/AboutPopover.tsx`**:
        *   **Purpose**: A popover component displayed on the About page, likely containing additional information or links.
        *   **Key Constructs**: React functional component, Ionic `IonPopover`.
    *   **`frontend/src/components/HomeOrTutorial.tsx`**:
        *   **Purpose**: A component that conditionally renders either the main home screen or a tutorial/onboarding flow based on user's first-time experience or preferences.
        *   **Key Constructs**: React functional component, conditional rendering logic.
    *   **`frontend/src/components/Menu.scss`**:
        *   **Purpose**: SCSS styling specific to the application's side menu (IonMenu).
    *   **`frontend/src/components/Menu.tsx`**:
        *   **Purpose**: The main side navigation menu component, providing links to different sections of the application.
        *   **Key Constructs**: React functional component, Ionic `IonMenu`, `IonContent`, `IonList`, `IonItem`, navigation logic.
    *   **`frontend/src/components/RedirectToLogin.tsx`**:
        *   **Purpose**: A utility component that redirects unauthenticated users to the login page.
        *   **Key Constructs**: React functional component, `useHistory` or similar routing hook, authentication state check.
    *   **`frontend/src/components/SessionList.tsx`**:
        *   **Purpose**: Displays a list of sessions (e.g., transactions, events). Likely used on schedule or transaction overview pages.
        *   **Key Constructs**: React functional component, Ionic `IonList`, mapping over data to render `SessionListItem` components.
    *   **`frontend/src/components/SessionListFilter.css`**:
        *   **Purpose**: CSS styling for the session list filtering UI.
    *   **`frontend/src/components/SessionListFilter.tsx`**:
        *   **Purpose**: Component that provides filtering options for lists of sessions/transactions.
        *   **Key Constructs**: React functional component, Ionic `IonToolbar`, `IonSearchbar`, `IonSegment`, filter state management.
    *   **`frontend/src/components/SessionListItem.tsx`**:
        *   **Purpose**: Represents a single item in a list of sessions/transactions. Displays key information and handles click events for detail view.
        *   **Key Constructs**: React functional component, Ionic `IonItem`, `IonLabel`, `IonNote`.
    *   **`frontend/src/components/ShareSocialFab.tsx`**:
        *   **Purpose**: A floating action button (FAB) that provides options for sharing content via social media or other platforms.
        *   **Key Constructs**: React functional component, Ionic `IonFab`, `IonFabButton`, `IonIcon`, social sharing plugin integration.
    *   **`frontend/src/components/SpeakerItem.tsx`**:
        *   **Purpose**: Displays information about a single speaker (e.g., on a speaker list page).
        *   **Key Constructs**: React functional component, Ionic `IonItem`, `IonAvatar`, `IonLabel`.
*   **`frontend/src/data/`**: Contains data management logic, including Redux state, actions, reducers, and data fetching utilities.
    *   **`frontend/src/data/AppContext.tsx`**:
        *   **Purpose**: Provides a React Context for global application data or utilities that need to be accessible throughout the component tree without prop drilling.
        *   **Key Constructs**: `createContext`, `useContext`, Context Provider.
    *   **`frontend/src/data/dataApi.ts`**:
        *   **Purpose**: Handles data fetching and manipulation. This might be an abstraction layer over `backendApi.ts` or directly interact with WatermelonDB for offline data.
        *   **Key Functions/Methods**: Functions for fetching, saving, and querying data for various entities (e.g., `getAccounts()`, `saveTransaction()`).
    *   **`frontend/src/data/selectors.ts`**:
        *   **Purpose**: Defines Redux selectors, which are pure functions used to extract and compute derived data from the Redux store state.
        *   **Key Constructs**: Selector functions (e.g., `selectUser`, `selectAccounts`).
    *   **`frontend/src/data/state.ts`**:
        *   **Purpose**: Defines the overall shape and initial state of the application's Redux store.
        *   **Key Constructs**: TypeScript interfaces for the global state, initial state objects.
    *   **`frontend/src/data/locations/`**:
        *   **`frontend/src/data/locations/locationsSlice.ts`**:
            *   **Purpose**: Redux Toolkit slice for managing location-related state (e.g., for spending heat-map).
            *   **Key Constructs**: `createSlice()`, reducers, extra reducers (for async actions).
    *   **`frontend/src/data/sessions/`**:
        *   **`frontend/src/data/sessions/conf.state.ts`**:
            *   **Purpose**: Defines the state shape specifically for conference-related data (e.g., schedule, speakers).
        *   **`frontend/src/data/sessions/sessionsSlice.ts`**:
            *   **Purpose**: Redux Toolkit slice for managing session data (e.g., transactions, schedule items).
            *   **Key Constructs**: `createSlice()`, reducers, extra reducers.
    *   **`frontend/src/data/user/`**:
        *   **`frontend/src/data/user/user.actions.ts`**:
            *   **Purpose**: Defines Redux actions for user-related operations (e.g., login, logout, update profile).
            *   **Key Constructs**: `createAction()`.
        *   **`frontend/src/data/user/user.reducer.ts`**:
            *   **Purpose**: Defines the Redux reducer logic for handling user-related state changes.
            *   **Key Constructs**: `createReducer()`, case reducers for actions.
        *   **`frontend/src/data/user/user.state.ts`**:
            *   **Purpose**: Defines the initial state and TypeScript interface for the user slice of the Redux store.
        *   **`frontend/src/data/user/userSlice.ts`**:
            *   **Purpose**: Redux Toolkit slice for managing user authentication and profile state.
            *   **Key Constructs**: `createSlice()`, reducers, extra reducers.
*   **`frontend/src/models/`**: Contains TypeScript interfaces for data models exchanged within the application and with the backend.
    *   **`frontend/src/models/Location.ts`**:
        *   **Purpose**: Defines the structure for location data (e.g., for GPS in transactions).
        *   **Key Constructs**: `interface Location { ... }`.
    *   **`frontend/src/models/Schedule.ts`**:
        *   **Purpose**: Defines the structure for schedule-related data.
        *   **Key Constructs**: `interface Schedule { ... }`.
    *   **`frontend/src/models/SessionGroup.ts`**:
        *   **Purpose**: Defines the structure for grouping sessions (e.g., transactions by date or category).
        *   **Key Constructs**: `interface SessionGroup { ... }`.
    *   **`frontend/src/models/Speaker.ts`**:
        *   **Purpose**: Defines the structure for speaker information.
        *   **Key Constructs**: `interface Speaker { ... }`.
*   **`frontend/src/pages/`**: Contains the main page components of the application, often corresponding to routes.
    *   **`frontend/src/pages/About.scss`**: Styling for the About page.
    *   **`frontend/src/pages/About.tsx`**:
        *   **Purpose**: Displays information about the application, version, and possibly legal notices.
        *   **Key Constructs**: React functional component, Ionic `IonPage`, `IonHeader`, `IonToolbar`, `IonTitle`, `IonContent`.
    *   **`frontend/src/pages/Account.scss`**: Styling for the Account page.
    *   **`frontend/src/pages/Account.tsx`**:
        *   **Purpose**: Allows users to view and manage their account details, preferences, and potentially authentication settings.
        *   **Key Constructs**: React functional component, Ionic form components, state management for user input.
    *   **`frontend/src/pages/DashboardPage.tsx`**:
        *   **Purpose**: The main dashboard or home page after a user logs in, providing an overview of financial data.
        *   **Key Constructs**: React functional component, Ionic layout components, data display components.
    *   **`frontend/src/pages/Login.scss`**: Styling for the Login page.
    *   **`frontend/src/pages/Login.tsx`**:
        *   **Purpose**: Provides the user interface for authenticating users.
        *   **Key Constructs**: React functional component, Ionic form components, authentication logic, API calls to `backendApi.ts`.
    *   **`frontend/src/pages/MainTabs.tsx`**:
        *   **Purpose**: Manages the main tab-based navigation at the bottom of the application.
        *   **Key Constructs**: React functional component, Ionic `IonTabs`, `IonTabBar`, `IonTabButton`, `IonIcon`, `IonLabel`.
    *   **`frontend/src/pages/MapView.scss`**: Styling for the Map View page.
    *   **`frontend/src/pages/MapView.tsx`**:
        *   **Purpose**: Displays a map interface, likely for the spending heat-map feature (FR-9).
        *   **Key Constructs**: React functional component, map library integration (e.g., Google Maps API), data visualization.
    *   **`frontend/src/pages/SchedulePage.scss`**: Styling for the Schedule page.
    *   **`frontend/src/pages/SchedulePage.tsx`**:
        *   **Purpose**: Displays a financial schedule or bill calendar (FR-8).
        *   **Key Constructs**: React functional component, Ionic list components, date/calendar components.
    *   **`frontend/src/pages/SessionDetail.scss`**: Styling for Session Detail page.
    *   **`frontend/src/pages/SessionDetail.tsx`**:
        *   **Purpose**: Displays detailed information about a single session or transaction.
        *   **Key Constructs**: React functional component, Ionic detail components, data fetching for specific item.
    *   **`frontend/src/pages/Signup.scss`**: Styling for the Signup page.
    *   **`frontend/src/pages/Signup.tsx`**:
        *   **Purpose**: Provides the user interface for new user registration.
        *   **Key Constructs**: React functional component, Ionic form components, registration logic, API calls to `backendApi.ts`.
    *   **`frontend/src/pages/SpeakerDetail.scss`**: Styling for Speaker Detail page.
    *   **`frontend/src/pages/SpeakerDetail.tsx`**:
        *   **Purpose**: Displays detailed information about a speaker. (Potentially a leftover from a template, or relevant if users can be "speakers" in shared pouches).
        *   **Key Constructs**: React functional component, Ionic detail components.
    *   **`frontend/src/pages/SpeakerList.scss`**: Styling for Speaker List page.
    *   **`frontend/src/pages/SpeakerList.tsx`**:
        *   **Purpose**: Displays a list of speakers. (Similar to `SpeakerDetail.tsx`, might be a template leftover or for shared pouch management).
        *   **Key Constructs**: React functional component, Ionic list components.
    *   **`frontend/src/pages/Support.scss`**: Styling for the Support page.
    *   **`frontend/src/pages/Support.tsx`**:
        *   **Purpose**: Provides a page for user support, FAQs, or contact information.
        *   **Key Constructs**: React functional component, Ionic layout components.
    *   **`frontend/src/pages/Tutorial.scss`**: Styling for the Tutorial page.
    *   **`frontend/src/pages/Tutorial.tsx`**:
        *   **Purpose**: Displays an introductory tutorial or onboarding slides for new users.
        *   **Key Constructs**: React functional component, Ionic `IonSlides`, navigation buttons.
*   **`frontend/src/theme/`**:
    *   **`frontend/src/theme/variables.css`**:
        *   **Purpose**: Defines CSS custom properties (variables) for application-wide theming, including colors, fonts, and spacing.
        *   **Key Constructs**: CSS variables (`--ion-color-primary`).
*   **`frontend/src/types/`**:
    *   **`frontend/src/types/images.d.ts`**:
        *   **Purpose**: TypeScript declaration file to allow importing image files (e.g., .png, .jpg) directly into TypeScript/React components.
        *   **Key Constructs**: `declare module '*.png';`.
*   **`frontend/src/util/`**:
    *   **`frontend/src/util/types.ts`**:
        *   **Purpose**: Contains generic or shared TypeScript utility types not specific to any single domain.
        *   **Key Constructs**: `type`, `interface` definitions.
*   **`frontend/src/utils/`**:
    *   **`frontend/src/utils/logger.ts`**:
        *   **Purpose**: Provides a centralized logging utility for the frontend application.
        *   **Key Functions/Methods**: `log()`, `warn()`, `error()`.
    *   **`frontend/src/utils/time.ts`**:
        *   **Purpose**: Contains utility functions for date and time manipulation or formatting.
        *   **Key Functions/Methods**: `formatDate()`, `getTimestamp()`.

## 3. Backend Detailed Design (`backend/`)

The `backend/` directory contains the Node.js API service, built with Fastify, which handles business logic and acts as an intermediary between the frontend and the database service.

### Core Files and Directories:

*   **`backend/.gitignore`**:
    *   **Purpose**: Specifies intentionally untracked files that Git should ignore.
*   **`backend/bun.lock`**:
    *   **Purpose**: Lock file generated by the Bun package manager, ensuring consistent dependency installations.
*   **`backend/Dockerfile`**:
    *   **Purpose**: Defines the Docker image for the backend service, specifying its environment and startup command.
*   **`backend/package-lock.json`**:
    *   **Purpose**: Lock file generated by npm/Yarn, ensuring consistent dependency installations.
*   **`backend/package.json`**:
    *   **Purpose**: Defines project metadata, scripts, and lists all Node.js dependencies.
*   **`backend/server.js`**:
    *   **Purpose**: The main entry point for the backend Fastify server. It initializes the Fastify instance, registers plugins, and sets up all API routes.
    *   **Key Functions/Modules**:
        *   `Fastify instance`: Configures the Fastify server (e.g., logging, CORS).
        *   `register plugins`: Calls `fastify.register()` for plugins like authentication.
        *   `register routes`: Calls `fastify.register()` for all route modules (e.g., `accountRoutes`, `userRoutes`).
        *   `start()`: Asynchronous function to start the Fastify server and listen for incoming requests.
*   **`backend/plugins/`**: Contains Fastify plugins for common functionalities.
    *   **`backend/plugins/authenticate.js`**:
        *   **Purpose**: A Fastify plugin that provides authentication middleware, typically verifying JWT tokens from incoming requests.
        *   **Key Functions/Methods**:
            *   `authenticate(request, reply, done)`: A Fastify hook or middleware function that performs JWT validation and attaches user information to the request object if successful.
*   **`backend/repositories/`**: Implements the Repository Pattern, abstracting database operations from the business logic.
    *   **`backend/repositories/DatabaseRepository.js`**:
        *   **Purpose**: A generic repository class that interacts with the SolFin Database Service via HTTP calls. It encapsulates the logic for common CRUD operations.
        *   **Key Functions/Methods**:
            *   `constructor(databaseManagerInstance)`: Initializes the repository with an instance of `IDatabaseManager` (or an HTTP client that mimics it).
            *   `create(table, data)`: Sends a POST request to the database service to create a new record in a specified table.
            *   `read(table, id)`: Sends a GET request to retrieve a record by ID from a specified table.
            *   `update(table, id, data)`: Sends a PUT request to update a record in a specified table.
            *   `delete(table, id)`: Sends a DELETE request to remove a record from a specified table.
            *   `query(table, filters)`: Sends a POST request to query records from a specified table using filters.
*   **`backend/routes/`**: Defines all API routes and their corresponding handler functions.
    *   **`backend/routes/accountRoutes.js`**:
        *   **Purpose**: Defines Fastify routes for managing financial accounts.
        *   **Key Functions/Methods**:
            *   `accountRoutes(fastify, options, done)`: Fastify plugin function that registers routes.
            *   `getAccountsRoute()`: Handler for `GET /accounts`.
            *   `createAccountRoute()`: Handler for `POST /accounts`.
            *   `getAccountByIdRoute()`: Handler for `GET /accounts/:id`.
            *   `updateAccountRoute()`: Handler for `PUT /accounts/:id`.
            *   `deleteAccountRoute()`: Handler for `DELETE /accounts/:id`.
    *   **`backend/routes/adminRoutes.js`**:
        *   **Purpose**: Defines Fastify routes for administrative operations, typically requiring elevated permissions.
        *   **Key Functions/Methods**:
            *   `adminRoutes(fastify, options, done)`: Plugin function.
            *   `migrateRoute()`: Handler for `POST /admin/migrate`.
            *   `seedRoute()`: Handler for `POST /admin/seed`.
            *   `healthRoute()`: Handler for `GET /admin/health`.
            *   `setupRoute()`: Handler for `POST /admin/setup`.
    *   **`backend/routes/confDataRoutes.js`**:
        *   **Purpose**: Likely placeholder or example routes for "conference data." (Based on `p.txt` errors, this might be a legacy or unused part.)
        *   **Key Functions/Methods**: `confDataRoutes(fastify, options, done)`, route handlers.
    *   **`backend/routes/goalRoutes.js`**:
        *   **Purpose**: Defines Fastify routes for managing financial goals.
        *   **Key Functions/Methods**: `goalRoutes(fastify, options, done)`, `getGoalsRoute()`, `createGoalRoute()`, `getGoalByIdRoute()`, `updateGoalRoute()`, `deleteGoalRoute()`.
    *   **`backend/routes/pouchRoutes.js`**:
        *   **Purpose**: Defines Fastify routes for managing budget pouches.
        *   **Key Functions/Methods**: `pouchRoutes(fastify, options, done)`, `getPouchesRoute()`, `createPouchRoute()`, `getPouchByIdRoute()`, `updatePouchRoute()`, `deletePouchRoute()`.
    *   **`backend/routes/transactionRoutes.js`**:
        *   **Purpose**: Defines Fastify routes for managing financial transactions.
        *   **Key Functions/Methods**: `transactionRoutes(fastify, options, done)`, `getTransactionsRoute()`, `createTransactionRoute()`, `createTransactionWithSplitsRoute()`, `getTransactionByIdRoute()`, `updateTransactionRoute()`, `deleteTransactionRoute()`.
    *   **`backend/routes/transferRoutes.js`**:
        *   **Purpose**: Defines Fastify routes for managing money transfers between accounts.
        *   **Key Functions/Methods**: `transferRoutes(fastify, options, done)`, `getTransfersRoute()`, `createTransferRoute()`, `getTransferByIdRoute()`, `updateTransferRoute()`, `deleteTransferRoute()`.
    *   **`backend/routes/userRoutes.js`**:
        *   **Purpose**: Defines Fastify routes for user authentication and profile management.
        *   **Key Functions/Methods**: `userRoutes(fastify, options, done)`, `registerUserRoute()`, `loginUserRoute()`, `getUserProfileRoute()`, `updateUserProfileRoute()`, `logoutUserRoute()`.
*   **`backend/controllers/`**: Contains request handlers that process incoming API requests, validate input, call appropriate services, and prepare responses.
    *   **`backend/controllers/AccountController.js`**:
        *   **Purpose**: Handles all account-related API requests.
        *   **Key Functions/Methods**:
            *   `getAccounts(request, reply)`: Retrieves accounts for a user.
                *   **Logic/Pseudocode**:
                    ```
                    FUNCTION getAccounts(request, reply):
                        // 1. Extract user ID from authenticated request (e.g., request.user.id)
                        userId = request.user.id
                        // 2. Call the DatabaseRepository to fetch accounts for the user
                        accounts = await DatabaseRepository.query("accounts", { userId: userId })
                        // 3. Respond with the fetched accounts
                        reply.send(accounts)
                    END FUNCTION
                    ```
            *   `createAccount(request, reply)`: Creates a new account.
                *   **Logic/Pseudocode**:
                    ```
                    FUNCTION createAccount(request, reply):
                        // 1. Extract account data from request body
                        accountData = request.body
                        // 2. Validate account data using ValidationHelper
                        ValidationHelper.validateAccountData(accountData)
                        // 3. Assign user ID from authenticated request to account data
                        accountData.userId = request.user.id
                        // 4. Call the DatabaseRepository to create the new account
                        newAccount = await DatabaseRepository.create("accounts", accountData)
                        // 5. Respond with the newly created account and 201 status
                        reply.code(201).send(newAccount)
                    END FUNCTION
                    ```
                *   **Flow Diagram (Mermaid)**:
                    ```mermaid
                    graph TD
                        A[Frontend Request] --> B(POST /accounts);
                        B --> C{Fastify Router};
                        C --> D(AccountController.createAccount);
                        D --> E{Extract & Validate Data};
                        E --> F(Assign userId from Auth);
                        F --> G(DatabaseRepository.create("accounts", accountData));
                        G --> H{Database Service API};
                        H --> I(Database Write Operation);
                        I --> J(Return Created Account);
                        J --> K(Reply 201 Created);
                        K --> A;
                    ```
            *   `getAccountById(request, reply)`: Retrieves a specific account.
                *   **Logic/Pseudocode**:
                    ```
                    FUNCTION getAccountById(request, reply):
                        // 1. Extract account ID from request parameters
                        accountId = request.params.id
                        // 2. Extract user ID from authenticated request
                        userId = request.user.id
                        // 3. Call the DatabaseRepository to read the account
                        account = await DatabaseRepository.read("accounts", accountId)
                        // 4. Check if account exists and belongs to the user
                        IF NOT account OR account.userId != userId:
                            reply.code(404).send({ message: "Account not found or unauthorized" })
                            RETURN
                        // 5. Respond with the fetched account
                        reply.send(account)
                    END FUNCTION
                    ```
            *   `updateAccount(request, reply)`: Updates an account.
                *   **Logic/Pseudocode**:
                    ```
                    FUNCTION updateAccount(request, reply):
                        // 1. Extract account ID from request parameters
                        accountId = request.params.id
                        // 2. Extract updated data from request body
                        updates = request.body
                        // 3. Extract user ID from authenticated request
                        userId = request.user.id
                        // 4. Validate update data
                        ValidationHelper.validateAccountData(updates) // Re-use or have specific update validation
                        // 5. Verify ownership before updating (optional, can be done in service)
                        existingAccount = await DatabaseRepository.read("accounts", accountId)
                        IF NOT existingAccount OR existingAccount.userId != userId:
                            reply.code(403).send({ message: "Unauthorized to update this account" })
                            RETURN
                        // 6. Call the DatabaseRepository to update the account
                        await DatabaseRepository.update("accounts", accountId, updates)
                        // 7. Respond with 200 OK or updated object
                        reply.send({ message: "Account updated successfully" })
                    END FUNCTION
                    ```
            *   `deleteAccount(request, reply)`: Deletes an account.
                *   **Logic/Pseudocode**:
                    ```
                    FUNCTION deleteAccount(request, reply):
                        // 1. Extract account ID from request parameters
                        accountId = request.params.id
                        // 2. Extract user ID from authenticated request
                        userId = request.user.id
                        // 3. Verify ownership before deleting
                        existingAccount = await DatabaseRepository.read("accounts", accountId)
                        IF NOT existingAccount OR existingAccount.userId != userId:
                            reply.code(403).send({ message: "Unauthorized to delete this account" })
                            RETURN
                        // 4. Call the DatabaseRepository to delete the account
                        await DatabaseRepository.delete("accounts", accountId)
                        // 5. Respond with 204 No Content
                        reply.code(204).send()
                    END FUNCTION
                    ```
    *   **`backend/controllers/AdminController.js`**:
        *   **Purpose**: Handles administrative API requests.
        *   **Key Functions/Methods**:
            *   `migrate(request, reply)`: Triggers database migrations.
            *   `seed(request, reply)`: Triggers database seeding.
            *   `health(request, reply)`: Checks database service health.
            *   `setup(request, reply)`: Completes database setup.
    *   **`backend/controllers/GoalController.js`**:
        *   **Purpose**: Handles goal-related API requests.
        *   **Key Functions/Methods**: CRUD operations for goals.
    *   **`backend/controllers/PouchController.js`**:
        *   **Purpose**: Handles pouch-related API requests.
        *   **Key Functions/Methods**: CRUD operations for pouches.
    *   **`backend/controllers/TransactionController.js`**:
        *   **Purpose**: Handles transaction-related API requests.
        *   **Key Functions/Methods**: CRUD operations for transactions, including splits.
    *   **`backend/controllers/TransferController.js`**:
        *   **Purpose**: Handles transfer-related API requests.
        *   **Key Functions/Methods**: CRUD operations for transfers.
    *   **`backend/controllers/UserController.js`**:
        *   **Purpose**: Handles user authentication and profile API requests.
        *   **Key Functions/Methods**: `register(request, reply)`, `login(request, reply)`, `getProfile(request, reply)`, `updateProfile(request, reply)`, `logout(request, reply)`.
*   **`backend/helpers/`**: Contains reusable utility functions and helper modules.
    *   **`backend/helpers/AuthHelper.js`**:
        *   **Purpose**: Provides utility functions for authentication-related tasks, such as password hashing, JWT token generation/validation (if not handled by a plugin).
        *   **Key Functions/Methods**: `hashPassword(password)`, `verifyPassword(password, hashedPassword)`, `generateToken(payload)`, `verifyToken(token)`.
    *   **`backend/helpers/ValidationHelper.js`**:
        *   **Purpose**: Provides utility functions for input validation.
        *   **Key Functions/Methods**: `validateUserData(data)`, `validateAccountData(data)`.
*   **`backend/services/`**: Contains business logic services that interact with repositories and perform core application operations.
    *   **`backend/services/UserService.js`**:
        *   **Purpose**: Implements business logic related to user management, such as registration, login, and profile updates. Interacts with `DatabaseRepository`.
        *   **Key Functions/Methods**:
            *   `registerUser(userData)`: Handles new user registration, including password hashing (if not handled by DB service) and saving to the database.
            *   `loginUser(credentials)`: Authenticates user credentials and generates JWT tokens.
            *   `getUserProfile(userId)`: Retrieves a user's profile data.
            *   `updateUserProfile(userId, updates)`: Updates a user's profile information.

## 4. Database Service Detailed Design (`solfin_database/`)

The `solfin_database/` directory contains the dedicated microservice responsible for all data persistence, including sharding, migrations, and exposing a RESTful API for data operations.

### Core Files and Directories:

*   **`solfin_database/.env`**:
    *   **Purpose**: Environment variables for configuring the database service (e.g., database paths, shard configurations).
*   **`solfin_database/cli.js`**:
    *   **Purpose**: A command-line interface (CLI) tool for managing the database service, including running migrations and seeders.
    *   **Key Functions/Methods**:
        *   `main()`: The main entry point for CLI command execution.
        *   `migrateCommand()`: CLI command to trigger database migrations.
        *   `seedCommand()`: CLI command to trigger database seeding.
        *   `healthCommand()`: CLI command to check the health status of the database service.
*   **`solfin_database/Dockerfile`**:
    *   **Purpose**: Defines the Docker image for the SolFin Database Service.
*   **`solfin_database/package.json`**:
    *   **Purpose**: Defines project metadata, scripts, and lists all Node.js dependencies for the database service.
*   **`solfin_database/server.js`**:
    *   **Purpose**: The main entry point for the database service's RESTful API. It initializes the database connections, sets up API routes for data operations, and starts the server.
    *   **Key Functions/Modules**:
        *   Fastify instance setup (similar to backend `server.js`).
        *   Route registration for generic CRUD and specialized operations.
        *   `start()`: Function to start the database service API server.
*   **`solfin_database/config/`**: Contains configuration files for the database service.
    *   **`solfin_database/config/database.js`**:
        *   **Purpose**: Defines database connection settings, shard configurations, and possibly database type (SQLite, Postgres, etc.) mappings.
    *   **`solfin_database/config/schemas.js`**:
        *   **Purpose**: Defines the database schemas for each functional shard. This would include table definitions, column types, and constraints.
*   **`solfin_database/lib/`**: Contains core library files for database management and operations.
    *   **`solfin_database/lib/DatabaseService.js`**:
        *   **Purpose**: Implements the core logic for handling data persistence requests. It acts as the central coordinator for routing requests to appropriate shards and executing operations.
        *   **Key Functions/Methods**:
            *   `constructor()`: Initializes with instances of `ShardManager`.
            *   `create(table, data)`: Handles generic create requests, routing to the correct shard.
            *   `read(table, id)`: Handles generic read requests.
            *   `update(table, id, data)`: Handles generic update requests.
            *   `delete(table, id)`: Handles generic delete requests.
            *   `query(table, filters)`: Handles generic query requests.
            *   `getUsersAccounts(userId)`: Specialized method to retrieve accounts for a specific user.
            *   `getUsersTransactions(userId)`: Specialized method to retrieve transactions for a specific user.
            *   `createTransactionWithSplits(data)`: Specialized method to handle transactions that involve splitting amounts across multiple pouches.
    *   **`solfin_database/lib/MigrationManager.js`**:
        *   **Purpose**: Manages database schema migrations, ensuring that the database structure evolves correctly with application changes.
        *   **Key Functions/Methods**:
            *   `runMigrations(version)`: Executes pending migration scripts up to a specified version.
            *   `rollbackMigrations(version)`: Reverts migration scripts to a specified version.
    *   **`solfin_database/lib/SeederManager.js`**:
        *   **Purpose**: Manages the seeding of demo data into the database for development and testing purposes.
        *   **Key Functions/Methods**:
            *   `runSeeders()`: Executes all defined seeder scripts.
    *   **`solfin_database/lib/ShardManager.js`**:
        *   **Purpose**: Manages connections and operations for individual SQLite database shards. It provides an interface to execute queries on specific shards.
        *   **Key Functions/Methods**:
            *   `constructor(shardConfig)`: Initializes a connection pool and defines the shard's properties.
            *   `getConnection()`: Retrieves a database connection from the pool.
            *   `execute(query, params)`: Executes an SQL query on the shard's database.
*   **`solfin_database/migrations/`**: Contains SQL or JavaScript files defining database schema changes.
    *   **`solfin_database/migrations/001_create_initial_tables.js`**:
        *   **Purpose**: Defines the initial set of database tables and their schemas.
        *   **Key Functions/Methods**:
            *   `up(db)`: Applies the schema changes (e.g., `CREATE TABLE` statements).
            *   `down(db)`: Reverts the schema changes (e.g., `DROP TABLE` statements).
    *   **`solfin_database/migrations/002_add_enhanced_features.js`**:
        *   **Purpose**: Defines schema changes for additional features or updates to existing tables.
        *   **Key Functions/Methods**: `up(db)`, `down(db)`.
*   **`solfin_database/seeders/`**: Contains scripts for populating the database with initial or demo data.
    *   **`solfin_database/seeders/001_demo_users.js`**:
        *   **Purpose**: Seeds initial demo user data into the `users.db` shard.
        *   **Key Functions/Methods**: `seed(db)`: Inserts user records.
    *   **`solfin_database/seeders/002_demo_accounts.js`**:
        *   **Purpose**: Seeds demo financial account data.
        *   **Key Functions/Methods**: `seed(db)`: Inserts account records.
    *   **`solfin_database/seeders/003_demo_pouches.js`**:
        *   **Purpose**: Seeds demo budget pouch data.
        *   **Key Functions/Methods**: `seed(db)`: Inserts pouch records.
    *   **`solfin_database/seeders/004_demo_transactions.js`**:
        *   **Purpose**: Seeds demo transaction data.
        *   **Key Functions/Methods**: `seed(db)`: Inserts transaction records.
    *   **`solfin_database/seeders/005_demo_transfers.js`**:
        *   **Purpose**: Seeds demo transfer data.
        *   **Key Functions/Methods**: `seed(db)`: Inserts transfer records.

## Conclusion

This detailed technical design document provides a comprehensive overview of the SolFin project's file structure and the key functional components within each file across the frontend, backend, and database services. This level of detail is intended to serve as a precise reference for development, maintenance, and future enhancements, ensuring a clear understanding of the codebase's organization and functionality.