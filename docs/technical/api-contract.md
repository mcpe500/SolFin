# SolFin Frontend-Backend API Contract

This document defines the API contract between the SolFin Ionic React frontend and the Node.js backend. It details the endpoints, request/response formats, and communication protocols.

## 1. Overview

The SolFin application utilizes a three-tier architecture where the Ionic React frontend communicates with the Node.js backend via RESTful APIs. The backend, in turn, communicates with the SolFin Database Service. This document focuses specifically on the **Frontend ↔ Backend Communication**.

## 2. Communication Protocol

All communication between the frontend and backend is performed via **RESTful HTTP/HTTPS** requests.

## 3. API Endpoints

The backend exposes a comprehensive set of RESTful endpoints for the frontend to consume, categorized by functional area.

### 3.1. User Management

*   **Registration, Login, Profile Management:** (Details to be expanded based on specific backend implementation, but generally includes:)
    *   `POST /users/register` - User registration
    *   `POST /users/login` - User login (returns JWT token)
    *   `GET /users/profile` - Get user profile (requires authentication)
    *   `PUT /users/profile` - Update user profile (requires authentication)
    *   `POST /users/logout` - User logout

### 3.2. Account Management

*   **Get User Accounts:**
    *   `GET /accounts?user_id={id}`
    *   **Description:** Retrieves a list of financial accounts for a specific user.
    *   **Authentication:** Required.
    *   **Parameters:**
        *   `user_id`: (Query Parameter, string) The ID of the user.
    *   **Response:** `200 OK` with an array of account objects.
*   **Create New Account:**
    *   `POST /accounts`
    *   **Description:** Creates a new financial account.
    *   **Authentication:** Required.
    *   **Request Body:** JSON object containing account details (e.g., `currency`, `type`, `initialBalance`).
    *   **Response:** `201 Created` with the newly created account object.
*   **Get Specific Account:**
    *   `GET /accounts/{id}`
    *   **Description:** Retrieves details of a specific financial account.
    *   **Authentication:** Required.
    *   **Parameters:**
        *   `id`: (Path Parameter, string) The ID of the account.
    *   **Response:** `200 OK` with the account object.
*   **Update Account:**
    *   `PUT /accounts/{id}`
    *   **Description:** Updates an existing financial account.
    *   **Authentication:** Required.
    *   **Parameters:**
        *   `id`: (Path Parameter, string) The ID of the account to update.
    *   **Request Body:** JSON object with updated account details.
    *   **Response:** `200 OK` with the updated account object.
*   **Delete Account:**
    *   `DELETE /accounts/{id}`
    *   **Description:** Deletes a financial account.
    *   **Authentication:** Required.
    *   **Parameters:**
        *   `id`: (Path Parameter, string) The ID of the account to delete.
    *   **Response:** `204 No Content` on successful deletion.

### 3.3. Transaction Management

*   **Get User Transactions:**
    *   `GET /transactions?user_id={id}`
    *   **Description:** Retrieves a list of transactions for a specific user.
    *   **Authentication:** Required.
    *   **Parameters:**
        *   `user_id`: (Query Parameter, string) The ID of the user.
    *   **Response:** `200 OK` with an array of transaction objects.
*   **Create Transaction:**
    *   `POST /transactions`
    *   **Description:** Creates a new transaction.
    *   **Authentication:** Required.
    *   **Request Body:** JSON object containing transaction details (e.g., `amount`, `currency`, `date-time`, `description`, `category`, `tags`, `pouch`, `account`).
    *   **Response:** `201 Created` with the newly created transaction object.
*   **Create Transaction with Pouch Splits:**
    *   `POST /transactions/with-splits`
    *   **Description:** Creates a new transaction that is split across multiple pouches.
    *   **Authentication:** Required.
    *   **Request Body:** JSON object containing transaction details and an array of split allocations.
    *   **Response:** `201 Created` with the newly created transaction object.
*   **Get Specific Transaction:**
    *   `GET /transactions/{id}`
    *   **Description:** Retrieves details of a specific transaction.
    *   **Authentication:** Required.
    *   **Parameters:**
        *   `id`: (Path Parameter, string) The ID of the transaction.
    *   **Response:** `200 OK` with the transaction object.
*   **Update Transaction:**
    *   `PUT /transactions/{id}`
    *   **Description:** Updates an existing transaction.
    *   **Authentication:** Required.
    *   **Parameters:**
        *   `id`: (Path Parameter, string) The ID of the transaction to update.
    *   **Request Body:** JSON object with updated transaction details.
    *   **Response:** `200 OK` with the updated transaction object.
*   **Delete Transaction:**
    *   `DELETE /transactions/{id}`
    *   **Description:** Deletes a transaction.
    *   **Authentication:** Required.
    *   **Parameters:**
        *   `id`: (Path Parameter, string) The ID of the transaction to delete.
    *   **Response:** `204 No Content` on successful deletion.

### 3.4. Pouch Management

*   **Get User Pouches:**
    *   `GET /pouches?user_id={id}`
    *   **Description:** Retrieves a list of budget pouches for a specific user.
    *   **Authentication:** Required.
    *   **Parameters:**
        *   `user_id`: (Query Parameter, string) The ID of the user.
    *   **Response:** `200 OK` with an array of pouch objects.
*   **Create Pouch:**
    *   `POST /pouches`
    *   **Description:** Creates a new budget pouch.
    *   **Authentication:** Required.
    *   **Request Body:** JSON object containing pouch details (e.g., `name`, `budgetAmount`, `isShared`).
    *   **Response:** `201 Created` with the newly created pouch object.
*   **Get Specific Pouch:**
    *   `GET /pouches/{id}`
    *   **Description:** Retrieves details of a specific budget pouch.
    *   **Authentication:** Required.
    *   **Parameters:**
        *   `id`: (Path Parameter, string) The ID of the pouch.
    *   **Response:** `200 OK` with the pouch object.
*   **Update Pouch:**
    *   `PUT /pouches/{id}`
    *   **Description:** Updates an existing budget pouch.
    *   **Authentication:** Required.
    *   **Parameters:**
        *   `id`: (Path Parameter, string) The ID of the pouch to update.
    *   **Request Body:** JSON object with updated pouch details.
    *   **Response:** `200 OK` with the updated pouch object.
*   **Delete Pouch:**
    *   `DELETE /pouches/{id}`
    *   **Description:** Deletes a budget pouch.
    *   **Authentication:** Required.
    *   **Parameters:**
        *   `id`: (Path Parameter, string) The ID of the pouch to delete.
    *   **Response:** `204 No Content` on successful deletion.

### 3.5. Admin Endpoints

These endpoints are typically used for administrative purposes and may require elevated privileges.

*   **Run Database Migrations:**
    *   `POST /admin/migrate`
    *   **Description:** Triggers database schema migrations.
    *   **Authentication:** Required (Admin).
    *   **Response:** `200 OK` on successful migration.
*   **Run Database Seeders:**
    *   `POST /admin/seed`
    *   **Description:** Populates the database with sample data.
    *   **Authentication:** Required (Admin).
    *   **Response:** `200 OK` on successful seeding.
*   **Check Database Service Health:**
    *   `GET /admin/health`
    *   **Description:** Checks the health status of the database service.
    *   **Authentication:** Required.
    *   **Response:** `200 OK` with health status.
*   **Complete Database Setup:**
    *   `POST /admin/setup`
    *   **Description:** Completes initial database setup.
    *   **Authentication:** Required (Admin).
    *   **Response:** `200 OK` on successful setup.

## 4. Authentication and Authorization

*   **Authentication:** JWT (JSON Web Tokens) will be used for authenticating requests. The login endpoint (`POST /users/login`) will return a JWT, which the frontend must include in the `Authorization` header of subsequent requests (e.g., `Bearer <token>`).
*   **Authorization:** The backend will implement role-based access control (RBAC) to ensure users only access resources they are authorized for. Admin endpoints will require specific admin roles.

## 5. Error Handling

The backend will return standard HTTP status codes for errors, along with a JSON response body containing an error message and optionally an error code.

*   `400 Bad Request`: Invalid request payload or parameters.
*   `401 Unauthorized`: Missing or invalid authentication token.
*   `403 Forbidden`: Authenticated user does not have permission to access the resource.
*   `404 Not Found`: Resource not found.
*   `500 Internal Server Error`: Unexpected server-side error.

## 6. Data Models (High-Level)

The API endpoints exchange data based on the following high-level models:

*   **User:** `id`, `email`, `name`, `preferences`, etc.
*   **Account:** `id`, `userId`, `currency`, `type`, `initialBalance`, `currentBalance`, etc.
*   **Transaction:** `id`, `userId`, `amount`, `currency`, `dateTime`, `description`, `category`, `tags`, `gps`, `images`, `pouchId`, `accountId`, `isExpense`, `isRecurring`, `isAsset`, `splits` (array of objects), etc.
*   **Pouch:** `id`, `userId`, `name`, `budgetAmount`, `currentAmount`, `isShared`, `members` (array of user roles), etc.
*   **Goal:** `id`, `userId`, `title`, `targetAmount`, `targetDate`, `linkedPouchId`, `progress`, etc.
*   **Transfer:** `id`, `userId`, `sourceAccountId`, `destinationAccountId`, `amount`, `currency`, `dateTime`, `description`, `linkedTransactionIds`, etc.

## 7. Future Considerations

*   **Real-time Updates:** WebSocket endpoints for live updates on shared pouches or transaction changes.
*   **Receipt Scanning Details:** Specific request/response formats for Gemini-Flash integration.
*   **Offline Sync Protocol:** Detailed specification for conflict resolution and data synchronization.

## 8. Relevant Project Files

This API contract is implemented and consumed across specific files and directories in both the frontend and backend applications.

### 8.1. Frontend (Client-side)

*   `frontend/src/api/backendApi.ts`: This file (or similar) would contain the client-side logic for making HTTP requests to the backend API endpoints. It would encapsulate the API calls, handle request/response transformations, and manage authentication headers.
*   `frontend/src/data/`: Data management modules within the frontend would utilize the `backendApi.ts` to fetch and submit data as per the defined API contract.
*   `frontend/src/pages/` and `frontend/src/components/`: UI components within these directories would trigger API calls via the `backendApi.ts` to interact with the backend and display data.

### 8.2. Backend (Server-side)

*   `backend/server.js`: The main Fastify server setup, where API routes are registered.
*   `backend/routes/`: This directory contains individual route files (e.g., `accountRoutes.js`, `transactionRoutes.js`, `userRoutes.js`, `adminRoutes.js`, `pouchRoutes.js`, `goalRoutes.js`, `transferRoutes.js`) that define the specific API endpoints, handle request parsing, invoke business logic services, and send responses according to this contract.
*   `backend/services/`: Business logic services (e.g., `UserService.js`) process requests and interact with the `DatabaseRepository` to fulfill the API contract's data requirements.
*   `backend/repositories/DatabaseRepository.js`: This repository abstracts the communication with the SolFin Database Service, ensuring data persistence operations align with the needs of the API contract.
*   `backend/plugins/authenticate.js`: Authentication plugins enforce the security requirements (e.g., JWT validation) outlined in this API contract.