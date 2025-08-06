# SolFin Backend Technical Document

This document provides a detailed technical overview of the SolFin backend application.

## 1. Overview

The SolFin backend is a Node.js application that serves as the central API layer for the SolFin financial planning application. It encapsulates all core business logic, handles user authentication, data validation, and orchestrates interactions with the dedicated SolFin Database Service. The backend is designed to be stateless and communicate with the database service exclusively via HTTP/REST.

## 2. Architecture and Technologies

*   **Framework:** Node.js (Fastify, as implied by project status)
*   **Database Interaction:** Repository Pattern (HTTP calls to SolFin Database Service)
*   **Integration:** Google Gemini-Flash Service wrapper (for receipt scanning)
*   **Communication:** RESTful APIs

## 3. Functional Requirements (FR) - Backend Perspective

The backend implements the business logic and API endpoints for the following functional requirements:

*   **FR-1 Accounts:** Provides RESTful API endpoints for CRUD operations on user accounts.
*   **FR-2 Pouches:** Provides RESTful API endpoints for CRUD operations on pouches, including management of private/shared status and user roles.
*   **FR-3 Transactions:** Provides RESTful API endpoints for CRUD operations on transactions, including handling transaction splits, recurring transactions, and soft delete/undelete.
*   **FR-4 Transfers:** Provides RESTful API endpoints for CRUD operations to manage money transfers between accounts or pouches.
*   **FR-5 Recurring Income (Salary):** Handles the backend logic for auto-creating income transactions based on user-defined schedules.
*   **FR-6 Asset vs Plain Spend:** Manages the logic for marking transactions as assets and their separate summation.
*   **FR-7 Goal-based Savings:** Provides backend logic for creating goals, calculating required contributions, and tracking progress.
*   **FR-8 Bill Calendar:** Manages the data and logic for the bill calendar, including marking bills as paid and creating corresponding transactions.
*   **FR-9 Spending Heat-map:** Processes and aggregates transaction data with GPS for heat-map visualization.
*   **FR-10 Voice Entry (offline):** (Future integration) Will process speech-to-text data from the frontend to draft transactions.
*   **FR-11 Receipt Scanning (backend mode):** Integrates with Google Gemini-Flash for receipt scanning, processing the returned JSON array and storing image hashes. Handles queuing scan jobs for offline first.
*   **FR-12 Offline First & Conflict Resolution:** Implements the sync layer to push changes to the backend, pull server changes, and manage automatic merge strategies (LWW + user override prompt).
*   **FR-13 Auth Modes:** Implements backend logic for stand-alone mode, logged-in modes (email, Google, Apple SSO), and handles export/import data.

## 4. Non-Functional Requirements (NFR) - Backend Responsibility

*   **NFR-2 Database Abstraction:** Achieved through the Repository Pattern, ensuring no direct database dependencies.
*   **NFR-3 Security:** Implements HTTPS/TLS, JWT access + refresh tokens, and will support end-to-end encryption for shared pouches (phase-2).
*   **NFR-4 Performance:** Optimized for efficient API responses and data processing.

## 5. Development Status (as per PROJECT-STATUS.md)

*   **Architecture Implementation:** Three-tier microservices architecture fully implemented with Backend API.
*   **Fully Implemented:**
    *   Backend API: 100% complete with all CRUD operations and clean Repository Pattern.
    *   Repository Pattern: 100% implemented with complete database abstraction.
    *   Backend Cleanup: 100% complete removal of all direct database dependencies.
    *   Route Handlers: Complete for user authentication, account, transaction (including splits), pouch, goal, and transfer management, as well as admin operations.
    *   Error handling and validation.
    *   HTTP client for database service communication.
*   **Partially Implemented:**
    *   Authentication: Basic implementation exists, needs JWT and proper security.
    *   Receipt Scanning: Backend structure is ready, Gemini integration needed.
    *   Offline Sync: Architecture supports it, sync logic needs implementation.
*   **Not Yet Implemented:**
    *   Real-time Features: WebSocket implementation for live updates.
    *   Advanced Security: JWT tokens, password hashing, rate limiting.
    *   Production Deployment: Docker containers, CI/CD pipelines.

## 6. API Endpoints (from api-spec.md)

### Frontend API Endpoints (Backend)

*   **Account Management**
    *   `GET /accounts?user_id={id}`
    *   `POST /accounts`
    *   `GET /accounts/{id}`
    *   `PUT /accounts/{id}`
    *   `DELETE /accounts/{id}`
*   **Transaction Management**
    *   `GET /transactions?user_id={id}`
    *   `POST /transactions`
    *   `POST /transactions/with-splits`
    *   `GET /transactions/{id}`
    *   `PUT /transactions/{id}`
    *   `DELETE /transactions/{id}`
*   **Pouch Management**
    *   `GET /pouches?user_id={id}`
    *   `POST /pouches`
    *   `GET /pouches/{id}`
    *   `PUT /pouches/{id}`
    *   `DELETE /pouches/{id}`
*   **Admin Endpoints**
    *   `POST /admin/migrate`
    *   `POST /admin/seed`
    *   `GET /admin/health`
    *   `POST /admin/setup`

## 7. Next Steps for Backend Development

As per `PROJECT-STATUS.md`, the next steps include:

*   Implement JWT tokens and password hashing for authentication.
*   Integrate Google Gemini-Flash for receipt scanning.
*   Implement sync logic for offline-first functionality.
*   Implement WebSocket for real-time features.
*   Develop production deployment strategies (Docker, CI/CD).

## 8. Backend Folder Structure

The backend application is organized under the `backend/` directory. Key sub-directories and files include:

*   `backend/server.js`: The main entry point for the backend Fastify server.
    *   **Purpose**: Initializes the Fastify instance, registers plugins, and sets up all API routes. This is the application's bootstrap file.
    *   **Key Functions/Modules**:
        *   `Fastify instance creation and configuration`: Sets up logging, CORS, and other Fastify options.
        *   `fastify.register(plugin)`: Registers various Fastify plugins, including authentication, content parsers, and route modules.
        *   `fastify.listen(port)`: Starts the HTTP server, making it listen for incoming requests on the configured port.
        *   **Logic/Pseudocode**:
            ```
            FUNCTION startServer():
                fastify = createFastifyApp({ logger: true })
                
                // Register plugins
                fastify.register(corsPlugin)
                fastify.register(authenticationPlugin) // Example: for JWT validation
                
                // Register routes
                fastify.register(accountRoutes)
                fastify.register(userRoutes)
                // ... register other route modules
                
                // Start listening for requests
                await fastify.listen({ port: 3001, host: '0.0.0.0' })
                console.log(`Backend API listening on ${fastify.server.address().port}`)
            END FUNCTION
            
            CALL startServer()
            ```
        *   **Flow Diagram (Mermaid)**:
            ```mermaid
            graph TD
                A[Application Start] --> B(Create Fastify Instance);
                B --> C(Register Plugins);
                C --> D(Register Routes);
                D --> E(Start Server Listening);
                E -- Incoming Request --> F(Route Handler);
            ```
*   `backend/package.json`: Defines project metadata, scripts, and lists all Node.js dependencies.
    *   **Purpose**: Manages project dependencies (e.g., `fastify`, `jsonwebtoken`, `axios`), defines scripts for starting the server, running tests, and other development tasks.
    *   **Key Constructs**: `name`, `version`, `description`, `main`, `scripts` (e.g., `start`, `dev`, `test`), `dependencies`, `devDependencies`.
*   `backend/Dockerfile`: Defines the Docker image for the backend service.
    *   **Purpose**: Provides instructions for building a Docker image that contains the backend application and its dependencies, ensuring a consistent and isolated deployment environment.
    *   **Key Constructs**: `FROM node:alpine`, `WORKDIR /app`, `COPY package*.json ./`, `RUN npm install`, `COPY . .`, `EXPOSE 3001`, `CMD ["npm", "start"]`.
*   `backend/.env`: Environment variables for configuration.
    *   **Purpose**: Stores sensitive information (e.g., database connection strings, API keys, JWT secrets) and environment-specific settings that should not be committed to version control.
    *   **Key Constructs**: `DATABASE_SERVICE_URL=http://localhost:3002`, `JWT_SECRET=your_secret_key`.
*   `backend/plugins/`: Contains Fastify plugins for common functionalities.
    *   **Purpose**: Modularize and encapsulate reusable Fastify features like authentication, request parsing, or custom decorators.
    *   **Key Constructs**: Fastify plugin functions (`fastify.plugin`), `fastify.decorateRequest`, `fastify.addHook`.
    *   **Examples**:
        *   `backend/plugins/authenticate.js`: A Fastify plugin that provides authentication middleware.
            *   **Purpose**: Typically verifies JWT tokens from incoming requests, attaching user information to the request object if successful.
            *   **Key Functions/Methods**:
                *   `authenticate(request, reply, done)`: A Fastify hook or middleware function (e.g., `preHandler`) that extracts JWT from `Authorization` header, verifies it using `AuthHelper.verifyToken`, and sets `request.user`.
                *   **Logic/Pseudocode**:
                    ```
                    FUNCTION authenticate(request, reply, done):
                        token = extract_token_from_header(request)
                        IF NOT token:
                            reply.code(401).send({ message: "Unauthorized: No token provided" })
                            RETURN done(new Error("No token"))
                        
                        TRY:
                            decoded = AuthHelper.verifyToken(token)
                            request.user = decoded // Attach user payload to request
                            done() // Continue processing request
                        CATCH error:
                            reply.code(401).send({ message: "Unauthorized: Invalid token" })
                            done(error)
                    END FUNCTION
                    ```
*   `backend/repositories/`: Implements the Repository Pattern, abstracting database operations from the business logic.
    *   **Purpose**: Provides a clean abstraction layer over data persistence. Instead of direct database calls, services interact with repositories which, in turn, communicate with the `solfin_database` service.
    *   **Key Constructs**: Classes with methods for CRUD operations.
    *   **Examples**:
        *   `backend/repositories/DatabaseRepository.js`: A generic repository class that interacts with the SolFin Database Service via HTTP calls.
            *   **Purpose**: Encapsulates the logic for common CRUD operations by making HTTP requests to the external Database Service.
            *   **Key Functions/Methods**:
                *   `constructor(databaseServiceUrl)`: Initializes with the URL of the database service.
                *   `create(table, data)`: Sends a `POST` request to `databaseServiceUrl/{table}`.
                *   `read(table, id)`: Sends a `GET` request to `databaseServiceUrl/{table}/{id}`.
                *   `update(table, id, data)`: Sends a `PUT` request to `databaseServiceUrl/{table}/{id}`.
                *   `delete(table, id)`: Sends a `DELETE` request to `databaseServiceUrl/{table}/{id}`.
                *   `query(table, filters)`: Sends a `POST` request to `databaseServiceUrl/{table}/query`.
                *   **Logic/Pseudocode (for create)**:
                    ```
                    ASYNC FUNCTION create(table, data):
                        TRY:
                            response = await axios.post(`${this.baseUrl}/${table}`, data)
                            RETURN response.data
                        CATCH error:
                            // Handle and re-throw specific database service errors
                            THROW error
                    END FUNCTION
                    ```
                *   **Flow Diagram (Mermaid)**:
                    ```mermaid
                    graph TD
                        A[Backend Service Call] --> B(DatabaseRepository.create);
                        B -- HTTP POST --> C[SolFin Database Service];
                        C --> D(Database Write);
                        D -- Data --> B;
                        B --> A[Return Result];
                    ```
*   `backend/routes/`: Defines all API routes and their corresponding handler functions.
    *   **Purpose**: Organizes API endpoints by resource, making the routing logic clear and maintainable. Each file defines a set of related routes.
    *   **Key Constructs**: Fastify route definitions (`fastify.get`, `fastify.post`, etc.), `preHandler` hooks for authentication, schema definitions for validation.
    *   **Examples**:
        *   `backend/routes/accountRoutes.js`: Defines Fastify routes for managing financial accounts.
            *   **Purpose**: Maps HTTP methods and paths to `AccountController` methods.
            *   **Key Functions/Methods**:
                *   `accountRoutes(fastify, options, done)`: Fastify plugin function to register routes.
                *   `fastify.get('/accounts', { preHandler: [fastify.authenticate], handler: AccountController.getAccounts })`: Example route definition.
*   `backend/controllers/`: Contains request handlers that process incoming API requests.
    *   **Purpose**: Acts as an intermediary between routes and services. Controllers parse request data, validate input (using helpers), call appropriate services, and format responses.
    *   **Key Constructs**: Static methods, error handling, input validation, service interaction.
    *   **Examples**: `AccountController.js`, `UserController.js`.
*   `backend/helpers/`: Contains reusable utility functions and helper modules.
    *   **Purpose**: Provides common functionalities that can be shared across different controllers or services, promoting code reusability and separation of concerns.
    *   **Key Constructs**: Static methods, pure functions.
    *   **Examples**:
        *   `backend/helpers/AuthHelper.js`: Provides utility functions for authentication-related tasks.
            *   **Purpose**: Centralizes logic for password hashing, JWT token generation, and verification.
            *   **Key Functions/Methods**: `hashPassword(password)`, `verifyPassword(password, hashedPassword)`, `generateToken(payload)`, `verifyToken(token)`.
        *   `backend/helpers/ValidationHelper.js`: Provides utility functions for input validation.
            *   **Purpose**: Centralizes data validation logic for various entities, ensuring data integrity before processing.
            *   **Key Functions/Methods**: `validateUserData(data)`, `validateAccountData(data)`, `validateTransactionData(data)`.
*   `backend/services/`: Contains business logic services.
    *   **Purpose**: Implements the core business logic of the application. Services orchestrate operations, interact with repositories, and enforce business rules.
    *   **Key Constructs**: Classes with methods for specific business domains.
    *   **Examples**:
        *   `backend/services/UserService.js`: Implements business logic related to user management.
            *   **Purpose**: Handles registration, login, and profile updates, interacting with `DatabaseRepository` and `AuthHelper`.
            *   **Key Functions/Methods**: `registerUser(userData)`, `loginUser(credentials)`, `getUserProfile(userId)`.