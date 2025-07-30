# SolFin Developer Setup Guide

This document serves as the main entry point for the SolFin Developer Setup Guide, emphasizing the setup for both frontend and backend development.

## Frontend Development (Ionic React)

The frontend of SolFin is built with Ionic React, providing a unified cross-platform solution.

*   **Setup:** Instructions for setting up your development environment for Ionic React projects, including prerequisites like Node.js, npm, Ionic CLI, and Capacitor CLI.
*   **Running the App:** Guidance on running the application across all supported platforms (Web PWA, Android, iOS) using Capacitor.
*   **Best Practices:** Tips for plugin management, debugging, and performance optimization.

## Backend Development (Node.js)

The backend provides the necessary API services and integrations, including the DatabaseManager service and Gemini-Flash integration.

*   **Database Manager:** Details on the `IDatabaseManager` interface and its various implementations (SQLite, PostgreSQL, MySQL, MongoDB, JSON flat-file), emphasizing its role as a database abstraction layer.
*   **Gemini-Flash Prompt Template:** Specifies the structure and usage of the prompt template for interacting with the Google Gemini-Flash AI service for receipt scanning.

## Key Development Sections

Refer to the sub-sections for detailed information:

*   [Setup](02-dev-guide/setup.md)
*   [Database Manager](02-dev-guide/db-manager.md)
*   [Ionic Cordova Tips](02-dev-guide/ionic-cordova-tips.md)
*   [Gemini Prompt](02-dev-guide/gemini-prompt.md)