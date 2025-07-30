# SolFin API Specification

This document serves as the main entry point for the SolFin API Specification, detailing the communication between the Ionic React frontend and the Node.js backend.

## Frontend-Backend Interaction

The SolFin application, powered by **Ionic React** (NFR-1) as a unified cross-platform app, communicates with the **Node.js backend** (Section 4: High-Level Architecture) primarily through a RESTful API. This API facilitates data exchange for all functional requirements, including:

*   **Data Persistence:** CRUD operations for Accounts, Pouches, Transactions, Transfers, and Goals are handled via API calls that interact with the `DatabaseManager` service on the backend.
*   **Advanced Features:** Integration with services like Google Gemini-Flash for receipt scanning (FR-11) is exposed through backend API endpoints.
*   **Synchronization:** The offline-first data model (FR-12) relies on the synchronization protocol (detailed below) to reconcile local and server-side data.

## API Documentation

Refer to the sub-sections for detailed information on the API:

*   [OpenAPI Specification](03-api/openapi.yaml)
*   [Synchronization Protocol](03-api/sync-protocol.md)