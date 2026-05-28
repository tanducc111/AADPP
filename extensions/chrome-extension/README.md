# AADPP OCR Region Selector

AADPP OCR Region Selector is a Chrome Manifest V3 extension that enables users to select a visible region on an AADPP document preview and send that region to the platform for OCR.

This extension is intentionally lightweight. It does not perform OCR in the browser and does not access document files directly. It only provides the region selection overlay and sends viewport coordinates back to the AADPP web app.

## Purpose

The extension supports the AADPP region OCR MVP:

```text
User opens document preview
  -> clicks extension popup
  -> drags a bounding box
  -> extension sends coordinates to AADPP frontend
  -> frontend calls backend region OCR endpoint
  -> backend crops the selected region
  -> Gemini OCR extracts text from the cropped image
```

## Features

- Chrome Manifest V3
- TypeScript source
- popup UI with connection status
- content script overlay injection
- drag-to-select bounding box
- Escape key cancellation
- blue AADPP-style selection rectangle
- no unnecessary browser permissions

## Permissions

| Permission  | Reason                                                                        |
| ----------- | ----------------------------------------------------------------------------- |
| `activeTab` | Allows the extension to interact with the current AADPP tab after user action |
| `scripting` | Injects the selector content script                                           |
| `storage`   | Reserved for lightweight extension state if needed later                      |

No host permissions are required for the MVP.

## Folder Structure

```text
extensions/chrome-extension/
  public/
    manifest.json
    popup.html
  scripts/
    copy-static.mjs
  src/
    background.ts
    chrome.d.ts
    contentScript.ts
    popup.ts
  package.json
  tsconfig.json
```

## Development

Install dependencies:

```powershell
npm install
```

Build the extension:

```powershell
npm run build
```

The build output is generated in:

```text
extensions/chrome-extension/dist
```

## Loading in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select `extensions/chrome-extension/dist`.
5. Open an AADPP document detail or OCR review page.
6. Click the extension icon and choose **Select OCR Region**.

## Integration Contract

The content script sends this browser message to the AADPP frontend:

```json
{
  "source": "aadpp-chrome-extension",
  "type": "AADPP_OCR_REGION_SELECTED",
  "payload": {
    "x": 120,
    "y": 240,
    "width": 500,
    "height": 180,
    "page": 1
  }
}
```

The frontend converts viewport coordinates into document-preview-relative coordinates and calls:

```text
POST /api/v1/documents/{document_id}/ocr-region
```

Backend request payload:

```json
{
  "x": 10,
  "y": 20,
  "width": 300,
  "height": 120,
  "display_width": 800,
  "display_height": 1100,
  "page": 1
}
```

## Security Notes

- The extension does not store authentication tokens.
- The extension does not call backend APIs directly.
- The backend still enforces JWT authentication and RBAC.
- Coordinates are treated as untrusted input and validated by the backend.
- Temporary cropped files are cleaned up after OCR.

## MVP Limitations

- The extension is optimized for desktop Chrome.
- Mobile support is out of scope.
- Advanced annotation tools are out of scope.
- Multi-page PDF coordinate mapping can be improved in a future dedicated PDF viewer phase.
