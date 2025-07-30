# Receipt Scanning (Backend Mode)

This section explains how to use the receipt scanning feature to automatically create transactions in SolFin. This feature is available when logged in (FR-13) and utilizes the Google Gemini-Flash service (FR-11).

## How it Works (FR-11)

1.  **Camera Scan:** Use the in-app camera to scan one or multiple receipts in a single batch.
2.  **Gemini-Flash Processing:** The scanned images are sent to the Gemini-Flash service, which performs OCR (Optical Character Recognition) and extracts key transaction details.
3.  **JSON Output:** Gemini-Flash returns a JSON array containing structured data for each receipt. The expected format for each item in the array is:
    ```json
    {
      "vendor": "Starbucks",
      "amount": 4.75,
      "currency": "USD",
      "date": "2024-07-28",
      "category": "Coffee",
      "items": ["Latte"],
      "imageHash": "sha256-of-image"
    }
    ```
4.  **Draft Transaction Creation:** SolFin automatically uses this extracted data to create draft transactions.
5.  **Duplicate Scan Prevention:** The `imageHash` (sha256 of the image) is stored by the app to prevent duplicate scans of the same receipt. If you attempt to scan an already processed receipt, the app will notify you.

## Offline Functionality (FR-11)

The receipt scanning feature is designed to work even when you are offline.

*   **Queue Scan Job:** If there is no internet connectivity, the scan job is queued locally on your device.
*   **Sync When Online:** Once connectivity is restored, the queued scan jobs are transparently synchronized with the backend, and the Gemini-Flash processing occurs.

## Manual Review and Editing

Even after automatic processing, you will have the opportunity to review and edit the draft transactions before finalizing them. This allows you to:

*   Adjust categories or tags.
*   Correct any OCR errors.
*   Split transactions across multiple pouches (FR-3).
*   Mark transactions as recurring (FR-3).
*   Add or modify GPS location (FR-3).