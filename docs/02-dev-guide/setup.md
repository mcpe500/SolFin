# Development Environment Setup

This guide provides instructions for setting up your development environment for SolFin.

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js and npm:** SolFin is built with JavaScript/TypeScript, so Node.js (which includes npm) is essential. We recommend using the LTS version.
*   **Git:** For version control and cloning the SolFin monorepo.
*   **Ionic CLI:** The command-line interface for Ionic framework development. Install globally using npm:
    ```bash
    npm install -g @ionic/cli
    ```
*   **Capacitor CLI:** Used for building native mobile applications from your Ionic project. Install globally:
    ```bash
    npm install -g @capacitor/cli
    ```
*   **JDK (Java Development Kit):** Required for Android development with Capacitor.
*   **Android Studio:** For Android SDK, emulator, and device management.
*   **Xcode (macOS only):** Required for iOS development with Capacitor.
*   **TypeScript:** While usually installed with Node.js, ensure you have it for type-checking and compilation.
*   **VS Code (Recommended IDE):** With extensions like ESLint, Prettier, and Ionic.

## Monorepo Setup

The SolFin project is structured as a monorepo (see Section 6 of SRS). Follow these steps to get started:

1.  **Clone the Repository:**
    ```bash
    git clone [repository-url] solfin
    cd solfin
    ```
2.  **Install Root Dependencies:**
    ```bash
    npm install
    ```
    This will install dependencies for the root and all workspaces (apps and packages).

## Running the Web PWA

To run the Web PWA for development:

1.  **Navigate to the web app directory:**
    ```bash
    cd apps/web
    ```
2.  **Start the development server:**
    ```bash
    ionic serve
    ```
    This will open the web application in your browser, typically at `http://localhost:8100`.

## Running the Mobile App (Android/iOS)

To run the mobile app on an emulator or device:

1.  **Add platform (if not already added):**
    ```bash
    ionic cap add android  # For Android
    ionic cap add ios      # For iOS (macOS only)
    ```
2.  **Build the web assets:**
    ```bash
    ionic build
    ```
3.  **Copy web assets to native platform:**
    ```bash
    ionic cap copy
    ```
4.  **Open the native IDE:**
    ```bash
    ionic cap open android # Opens Android Studio
    ionic cap open ios     # Opens Xcode (macOS only)
    ```
    From Android Studio or Xcode, you can then build and run the app on your desired emulator or connected device.

## Database Setup

For local development, the app will use SQLite (WatermelonDB) by default. No additional setup is required for this. For backend development, refer to the `Database Manager` documentation.