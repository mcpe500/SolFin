# Synchronization Protocol

This document describes the synchronization protocol used between the SolFin client and backend, focusing on how data is exchanged and conflicts are managed (FR-12).

## Overview

The synchronization protocol ensures data consistency across all user devices and the backend server. It is designed to support SolFin's offline-first capabilities, allowing users to make changes locally and have them seamlessly sync when connectivity is available.

## Key Principles

*   **Offline First:** All writes are initially stored in the local SQLite database on the client device.
*   **Queued Changes:** When offline, changes are queued and transparently pushed to the backend when an internet connection is established.
*   **Bidirectional Sync:** The sync layer facilitates both pushing local changes to the server and pulling server changes to the client.

## Synchronization Process

The synchronization process typically involves the following steps:

1.  **Detect Connectivity:** The client monitors network connectivity. When a connection is detected (or re-established), the sync process is initiated.
2.  **Identify Local Changes:** The client identifies all changes (new, updated, deleted records) that have occurred locally since the last successful synchronization.
3.  **Push Local Changes to Server:** The client sends these local changes to the backend API.
4.  **Server-Side Processing:** The backend processes the incoming client changes. This is where conflict resolution logic is applied.
5.  **Identify Server Changes:** The backend identifies any changes that have occurred on the server since the client's last synchronization.
6.  **Pull Server Changes to Client:** The backend sends these server changes back to the client.
7.  **Client-Side Reconciliation:** The client receives server changes and reconciles them with its local data, applying the conflict resolution strategy.

## Conflict Resolution Strategy (LWW + User Override Prompt)

SolFin employs a combination of "Last Write Wins" (LWW) and user intervention for conflict resolution (FR-12):

*   **Last Write Wins (LWW):** For most data types, if a record has been modified by both the client and the server since the last sync, the version with the most recent timestamp is considered the authoritative version. This is a common and efficient strategy for many types of data.
*   **User Override Prompt:** For certain critical data types or in scenarios where LWW might lead to undesirable outcomes, the system will prompt the user to manually resolve the conflict. This gives the user ultimate control over their data, ensuring that no important information is lost or incorrectly overwritten. The prompt will typically present both versions of the conflicting data and allow the user to choose which one to keep or to merge them manually.

## Data Consistency and Integrity

The synchronization protocol is designed to ensure:

*   **Eventual Consistency:** While temporary discrepancies may exist during offline periods or active synchronization, all data will eventually become consistent across all synchronized instances.
*   **Data Integrity:** Mechanisms are in place to prevent data corruption and ensure the integrity of financial records.

## Security Considerations

*   **HTTPS/TLS:** All communication during synchronization is secured using HTTPS/TLS (NFR-3) to protect data in transit.
*   **Authentication:** User authentication (JWT access + refresh tokens, NFR-3) is required for synchronization to ensure that only authorized users can access and modify their data.