# SolFin Documentation

This directory contains all the comprehensive documentation for the SolFin project.

## High-Level Architecture Overview

SolFin is a personal & family finance planner built with a robust, cross-platform architecture.

*   **Frontend (Ionic React):** The user-facing application is developed using Ionic React, enabling a single codebase to be exported to Android APK, iOS IPA, and Web PWA. This cross-platform capability (NFR-1) ensures a consistent user experience across different devices.

*   **Backend (Node.js):** The backend provides the necessary API services and integrations, including:
    *   **DatabaseManager Service:** An abstraction layer for data persistence, allowing flexibility to swap between various database technologies (NFR-2).
    *   **Gemini-Flash Service:** A wrapper for integrating with Google Gemini-Flash for advanced features like receipt scanning (FR-11).

## Documentation Sections

*   [User Guide](user-guide.md)
*   [Developer Guide](dev-setup.md)
*   [API Specification](api-spec.md)
*   [Software Requirement Specification (SRS)](00-overview.md)