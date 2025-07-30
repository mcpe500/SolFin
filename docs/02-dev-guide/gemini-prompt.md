# Gemini-Flash Prompt Template

This document specifies the prompt template used for interacting with the Google Gemini-Flash AI service for receipt scanning (FR-11).

## System Prompt

The system prompt defines the AI's role and expected output format. It is crucial for ensuring that Gemini-Flash returns data in a structured and predictable manner, which is then parsed by the SolFin application.

```
System prompt:
You are a receipt OCR assistant.  
Return ONLY a JSON array with no extra text.  
Keys: vendor, amount, currency, date (YYYY-MM-DD), category, items (array of strings), imageHash (sha256).
```

*   **`You are a receipt OCR assistant.`**: This sets the persona for the AI, guiding its interpretation of the input.
*   **`Return ONLY a JSON array with no extra text.`**: This is a critical instruction to ensure the output is machine-readable and can be directly parsed by the application. Any conversational or explanatory text from the AI would interfere with automated processing.
*   **`Keys: vendor, amount, currency, date (YYYY-MM-DD), category, items (array of strings), imageHash (sha256).`**: This explicitly defines the required keys and their expected data types within each JSON object in the array. This ensures consistency and simplifies data extraction on the application side.

## User Prompt

The user prompt is where the actual image data is provided to the Gemini-Flash service.

```
User prompt:
[IMAGE_BASE64]
```

*   **`[IMAGE_BASE64]`**: This placeholder indicates that the actual base64 encoded image data of the scanned receipt will be inserted here when the prompt is sent to the Gemini-Flash API.

## Importance of the Template

This structured prompt template is vital for:

*   **Automation:** Enables SolFin to automatically parse the AI's response and create draft transactions without manual intervention.
*   **Accuracy:** Guides the AI to extract specific, relevant information from receipts.
*   **Consistency:** Ensures that the output format remains consistent, simplifying integration and reducing errors.
*   **Efficiency:** Optimizes the AI's processing by clearly defining the task and expected output.