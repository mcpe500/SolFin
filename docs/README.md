# SolFin Documentation

This directory contains all the comprehensive documentation for the SolFin project.

## High-Level Architecture Overview

SolFin is a personal & family finance planner built with a robust, cross-platform architecture.

*   **Frontend (Ionic React):** The user-facing application is developed using Ionic React, enabling a single codebase to be exported to Android APK, iOS IPA, and Web PWA. This cross-platform capability (NFR-1) ensures a consistent user experience across different devices.

*   **Backend (Node.js):** The backend provides the necessary API services and integrations, including:
    *   **Repository Pattern:** Abstracts database operations through HTTP calls to the dedicated database service.
    *   **Gemini-Flash Service:** A wrapper for integrating with Google Gemini-Flash for advanced features like receipt scanning (FR-11).

*   **SolFin Database Service:** A dedicated microservice that handles all database operations:
    *   **Sharded SQLite Cluster:** Multiple SQLite databases partitioned by functional domains
    *   **Load Balancing:** Read/write separation with multiple read replicas per shard
    *   **Migration & Seeder Management:** Database versioning and sample data management
    *   **RESTful API:** HTTP endpoints for all database operations

## Documentation Sections

*   [User Guide](01-user-guide/)
*   [Developer Guide](02-dev-guide/)
*   [API Specification](03-api/)
*   [Software Requirement Specification (SRS)](00-overview.md)

## Architecture Components

*   **Frontend (Ionic React):** Cross-platform application for Android, iOS, and Web PWA
*   **Backend API (Node.js/Fastify):** Business logic layer using Repository Pattern
*   **SolFin Database Service:** Sharded SQLite microservice with load balancing
*   **Migration System:** Database versioning across all shards
*   **Seeder System:** Sample data management for development and testing