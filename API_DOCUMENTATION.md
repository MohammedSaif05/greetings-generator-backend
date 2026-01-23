# Greetings Generator API Documentation

## Base URL
```
http://localhost:3000/api
```

## Table of Contents
1. [Upload Background Image](#1-upload-background-image)
2. [Create Template](#2-create-template)
3. [Get All Templates](#3-get-all-templates)

---

## 1. Upload Background Image

Upload a background image to Cloudflare R2 and get an asset ID and URL.

### Endpoint
```
POST /templates/assets
```

### Request

**Content-Type:** `multipart/form-data`

**Body:**
- `file` (required): Image file (PNG, JPEG, JPG, or WEBP)

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/api/templates/assets \
  -F "file=@background.png"
```

**Example using JavaScript (FormData):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:3000/api/templates/assets', {
  method: 'POST',
  body: formData
})
  .then(response => response.json())
  .then(data => console.log(data));
```

### Response

**Success (200 OK):**
```json
{
  "assetId": "asset_1234567890abcdef1234567890abcdef",
  "imageUrl": "https://cdn.cloudflare.com/templates/asset_1234567890abcdef1234567890abcdef.png"
}
```

**Error Responses:**

- **400 Bad Request** - No file uploaded:
```json
{
  "statusCode": 400,
  "message": "No file uploaded",
  "error": "Bad Request"
}
```

- **400 Bad Request** - Invalid file type:
```json
{
  "statusCode": 400,
  "message": "Invalid file type. Only PNG, JPEG, JPG, and WEBP are allowed.",
  "error": "Bad Request"
}
```

- **400 Bad Request** - Upload failed:
```json
{
  "statusCode": 400,
  "message": "Failed to upload file: [error details]",
  "error": "Bad Request"
}
```

### Validation Rules
- File must be provided
- Allowed MIME types: `image/png`, `image/jpeg`, `image/jpg`, `image/webp`
- File size limits depend on your Cloudflare R2 configuration

### Notes
- The `assetId` is a unique identifier that should be stored and used when creating templates
- The `imageUrl` can be either a public URL (if `CLOUDFLARE_R2_PUBLIC_URL` is configured) or a signed URL (valid for 1 year)
- Asset IDs are generated using UUID format: `asset_[uuid-without-dashes]`

---

## 2. Create Template

Save a complete template definition to MongoDB with full validation.

### Endpoint
```
POST /templates
```

### Request

**Content-Type:** `application/json`

**Body:**
```json
{
  "templateId": "sample_01",
  "orientation": "landscape",
  "canvas": {
    "width": 1200,
    "height": 675
  },
  "backgroundImage": {
    "assetId": "asset_abc123",
    "url": "https://cdn.cloudflare.com/templates/sample_01_bg.png"
  },
  "textAreas": [
    {
      "id": "textArea_1769076723367",
      "x": 264,
      "y": 270,
      "width": 756,
      "height": 100,
      "fontFamily": "Arial.ttf",
      "fontColor": "#000000",
      "maxFontSize": 48,
      "minFontSize": 16,
      "textAlign": "center",
      "lineHeight": 1.2
    }
  ]
}
```

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "sample_01",
    "orientation": "landscape",
    "canvas": {
      "width": 1200,
      "height": 675
    },
    "backgroundImage": {
      "assetId": "asset_abc123",
      "url": "https://cdn.cloudflare.com/templates/sample_01_bg.png"
    },
    "textAreas": [
      {
        "id": "textArea_1769076723367",
        "x": 264,
        "y": 270,
        "width": 756,
        "height": 100,
        "fontFamily": "Arial.ttf",
        "fontColor": "#000000",
        "maxFontSize": 48,
        "minFontSize": 16,
        "textAlign": "center",
        "lineHeight": 1.2
      }
    ]
  }'
```

**Example using JavaScript:**
```javascript
const templateData = {
  templateId: "sample_01",
  orientation: "landscape",
  canvas: {
    width: 1200,
    height: 675
  },
  backgroundImage: {
    assetId: "asset_abc123",
    url: "https://cdn.cloudflare.com/templates/sample_01_bg.png"
  },
  textAreas: [
    {
      id: "textArea_1769076723367",
      x: 264,
      y: 270,
      width: 756,
      height: 100,
      fontFamily: "Arial.ttf",
      fontColor: "#000000",
      maxFontSize: 48,
      minFontSize: 16,
      textAlign: "center",
      lineHeight: 1.2
    }
  ]
};

fetch('http://localhost:3000/api/templates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(templateData)
})
  .then(response => response.json())
  .then(data => console.log(data));
```

### Response

**Success (201 Created):**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "templateId": "sample_01",
  "orientation": "landscape",
  "canvas": {
    "width": 1200,
    "height": 675
  },
  "backgroundImage": {
    "assetId": "asset_abc123",
    "url": "https://cdn.cloudflare.com/templates/sample_01_bg.png"
  },
  "textAreas": [
    {
      "id": "textArea_1769076723367",
      "x": 264,
      "y": 270,
      "width": 756,
      "height": 100,
      "fontFamily": "Arial.ttf",
      "fontColor": "#000000",
      "maxFontSize": 48,
      "minFontSize": 16,
      "textAlign": "center",
      "lineHeight": 1.2
    }
  ],
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

- **400 Bad Request** - Validation errors:
```json
{
  "statusCode": 400,
  "message": [
    "templateId should not be empty",
    "orientation must be one of the following values: square, portrait, landscape"
  ],
  "error": "Bad Request"
}
```

- **409 Conflict** - Template ID already exists:
```json
{
  "statusCode": 409,
  "message": "Template with templateId \"sample_01\" already exists",
  "error": "Conflict"
}
```

- **400 Bad Request** - Canvas dimensions don't match orientation:
```json
{
  "statusCode": 400,
  "message": "Canvas dimensions do not match landscape orientation (width > height)",
  "error": "Bad Request"
}
```

- **400 Bad Request** - Text area validation error:
```json
{
  "statusCode": 400,
  "message": "TextArea textArea_1769076723367: x + width (1020) exceeds canvas width (1000)",
  "error": "Bad Request"
}
```

### Request Schema

#### Root Object
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `templateId` | string | Yes | Unique identifier for the template |
| `orientation` | enum | Yes | One of: `square`, `portrait`, `landscape` |
| `canvas` | object | Yes | Canvas dimensions (see Canvas Object) |
| `backgroundImage` | object | Yes | Background image details (see Background Image Object) |
| `textAreas` | array | Yes | Array of text area definitions (min 1 item) |

#### Canvas Object
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `width` | number | Yes | Must be > 0, must match orientation |
| `height` | number | Yes | Must be > 0, must match orientation |

**Orientation Validation:**
- `square`: width ≈ height (within 10% tolerance)
- `portrait`: height > width
- `landscape`: width > height

#### Background Image Object
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `assetId` | string | Yes | Asset ID from the upload endpoint |
| `url` | string | Yes | Full URL to the image |

#### Text Area Object
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `id` | string | Yes | Must be unique within the array |
| `x` | number | Yes | Must be ≥ 0, x + width ≤ canvas.width |
| `y` | number | Yes | Must be ≥ 0, y + height ≤ canvas.height |
| `width` | number | Yes | Must be > 0 |
| `height` | number | Yes | Must be > 0 |
| `fontFamily` | string | Yes | Font family name (e.g., "Arial.ttf") |
| `fontColor` | string | Yes | Hex color code (e.g., "#000000") |
| `maxFontSize` | number | Yes | Must be ≥ 1, must be ≥ minFontSize |
| `minFontSize` | number | Yes | Must be ≥ 1, must be ≤ maxFontSize |
| `textAlign` | string | Yes | One of: `left`, `center`, `right`, `justify` |
| `lineHeight` | number | Yes | Must be between 0.5 and 3 |

### Validation Rules

The backend performs the following validations:

1. **Template ID Uniqueness**
   - `templateId` must be unique across all templates
   - Returns 409 Conflict if duplicate

2. **Orientation Validation**
   - Must be one of: `square`, `portrait`, `landscape`
   - Canvas dimensions must match the specified orientation:
     - **Square**: width/height ratio ≈ 1 (within 10% tolerance)
     - **Portrait**: height > width
     - **Landscape**: width > height

3. **Background Image**
   - `assetId` is required
   - Should reference a valid asset uploaded via `/api/templates/assets`

4. **Text Areas**
   - At least one text area is required
   - Each `textArea.id` must be unique within the array
   - `minFontSize` ≤ `maxFontSize` for each text area
   - Each text area must fit completely within the canvas:
     - `x + width ≤ canvas.width`
     - `y + height ≤ canvas.height`
     - `x ≥ 0` and `y ≥ 0`

5. **General Field Validation**
   - All required fields must be present
   - Numeric values must be within valid ranges
   - String fields must not be empty
   - `fontColor` must be a valid hex color code

### MongoDB Document Structure

The saved document includes additional fields:

```json
{
  "_id": "ObjectId(...)",
  "templateId": "sample_01",
  "orientation": "landscape",
  "canvas": { ... },
  "backgroundImage": { ... },
  "textAreas": [ ... ],
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

- `_id`: MongoDB ObjectId (auto-generated)
- `status`: Always set to `"ACTIVE"` on creation
- `createdAt`: Timestamp (auto-generated)
- `updatedAt`: Timestamp (auto-generated)

---

## 3. Get All Templates

Retrieve a list of all templates with simplified information.

### Endpoint
```
GET /templates
```

### Request

No request body required.

**Example using cURL:**
```bash
curl -X GET http://localhost:3000/api/templates
```

**Example using JavaScript:**
```javascript
fetch('http://localhost:3000/api/templates', {
  method: 'GET'
})
  .then(response => response.json())
  .then(data => console.log(data));
```

### Response

**Success (200 OK):**
```json
[
  {
    "templateId": "sample_01",
    "orientation": "landscape",
    "canvas": {
      "width": 1200,
      "height": 675
    },
    "thumbnailUrl": "https://cdn.cloudflare.com/templates/sample_01_thumb.png",
    "status": "ACTIVE"
  },
  {
    "templateId": "birthday_card_01",
    "orientation": "portrait",
    "canvas": {
      "width": 800,
      "height": 1200
    },
    "thumbnailUrl": "https://cdn.cloudflare.com/templates/birthday_card_01_thumb.png",
    "status": "ACTIVE"
  }
]
```

**Empty Response (200 OK):**
If no templates exist, an empty array is returned:
```json
[]
```

### Response Schema

#### Template List Item
| Field | Type | Description |
|-------|------|-------------|
| `templateId` | string | Unique identifier for the template |
| `orientation` | string | Template orientation: `square`, `portrait`, or `landscape` |
| `canvas` | object | Canvas dimensions (see Canvas Object) |
| `thumbnailUrl` | string | URL to the template thumbnail image |
| `status` | string | Template status: `ACTIVE`, `INACTIVE`, or `ARCHIVED` |

#### Canvas Object
| Field | Type | Description |
|-------|------|-------------|
| `width` | number | Canvas width in pixels |
| `height` | number | Canvas height in pixels |

### Notes

- Returns all templates from the database
- The response includes only essential template information for listing purposes
- If a template has a `thumbnailUrl` field, it will be used; otherwise, the `backgroundImage.url` is used as a fallback
- Templates are returned in the order they were retrieved from the database
- Use this endpoint to display a list of available templates in your UI
- For full template details, you may want to implement a `GET /templates/:templateId` endpoint in the future

---

## Environment Variables

Make sure to set the following environment variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/greetings-generator

# Cloudflare R2 Configuration
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
CLOUDFLARE_R2_PUBLIC_URL=https://your-public-domain.com
```

---

## Error Handling

All endpoints return standard HTTP status codes:

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Validation error or invalid input
- **409 Conflict**: Resource already exists (duplicate templateId)
- **500 Internal Server Error**: Server error

Error responses follow this format:
```json
{
  "statusCode": 400,
  "message": "Error message or array of validation errors",
  "error": "Error type"
}
```

---

## Example Workflow

1. **Upload a background image:**
   ```bash
   POST /api/templates/assets
   # Returns: { "assetId": "asset_123", "imageUrl": "https://..." }
   ```

2. **Create a template using the asset:**
   ```bash
   POST /api/templates
   {
     "templateId": "birthday_card_01",
     "orientation": "landscape",
     "canvas": { "width": 1200, "height": 675 },
     "backgroundImage": {
       "assetId": "asset_123",
       "url": "https://..."
     },
     "textAreas": [ ... ]
   }
   ```

3. **Get all templates:**
   ```bash
   GET /api/templates
   # Returns: [ { "templateId": "...", "orientation": "...", ... }, ... ]
   ```

---

## Notes

- All endpoints are prefixed with `/api`
- The server runs on port `3000` by default
- File uploads are limited to image types (PNG, JPEG, JPG, WEBP)
- Template IDs must be unique
- Asset IDs are permanent identifiers - use them instead of URLs when referencing assets
- Canvas dimensions are validated against the specified orientation with a 10% tolerance for square orientation
