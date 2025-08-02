# SolFin Developer Setup Guide

This document serves as the main entry point for the SolFin Developer Setup Guide, emphasizing the setup for both frontend and backend development.

## Frontend Development (Ionic React)

The frontend of SolFin is built with Ionic React, providing a unified cross-platform solution.

*   **Setup:** Instructions for setting up your development environment for Ionic React projects, including prerequisites like Node.js, npm, Ionic CLI, and Capacitor CLI.
*   **Running the App:** Guidance on running the application across all supported platforms (Web PWA, Android, iOS) using Capacitor.
*   **Best Practices:** Tips for plugin management, debugging, and performance optimization.

## Backend Development (Node.js)

The backend provides business logic and API services using a Repository Pattern to communicate with the database service.

*   **Repository Pattern:** Abstracts database operations through HTTP calls to the SolFin Database Service
*   **Business Logic:** Handles authentication, validation, and application workflows
*   **Gemini-Flash Integration:** AI-powered receipt scanning functionality

## SolFin Database Service Development

The database service is a dedicated microservice that handles all data persistence operations.

*   **Sharded Architecture:** Multiple SQLite databases partitioned by functional domains
*   **Load Balancing:** Read/write separation with multiple read replicas
*   **Migration System:** Database versioning and schema management
*   **Seeder System:** Sample data management for development and testing

## Key Development Sections

Refer to the sub-sections for detailed information:

*   [Complete Setup Guide](02-dev-guide/complete-setup.md)
*   [Backend Architecture](02-dev-guide/backend-architecture.md)
*   [Setup](02-dev-guide/setup.md)
*   [Database Manager](02-dev-guide/db-manager.md)
*   [SolFin Database Service](02-dev-guide/solfin-database.md)
*   [API Endpoints Reference](02-dev-guide/api-endpoints.md)
*   [Ionic Cordova Tips](02-dev-guide/ionic-cordova-tips.md)
*   [Gemini Prompt](02-dev-guide/gemini-prompt.md)