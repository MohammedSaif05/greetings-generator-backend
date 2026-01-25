# Bulk Greetings Generation API Documentation

## Overview

The Bulk Greetings Generation API allows you to process multiple greeting cards at once by uploading a CSV file. The API validates the input, generates personalized greeting images for each row, and returns URLs to the generated images.

**Key Architectural Principle:** A template generates only images in its own orientation. A landscape template will never generate square or portrait images - only multiple resolutions of landscape images.

## Base URL
```
http://localhost:3000/api
```

---

## Endpoint

### POST /api/greetings/bulk

Process a CSV file containing greeting data and generate personalized greeting images.

---

## Request

### Content-Type
```
multipart/form-data
```

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | CSV file containing greeting data |
| `templateId` | string | Yes | Template identifier to use for all greeting generations |

### CSV File Requirements

**File Type:** `.csv`  
**Maximum Size:** 50MB  
**Required Headers:** Must include exactly these columns (case-sensitive):
- `recipientName`
- `occasion`
- `message`
- `senderName`

### CSV Format

The CSV file must follow this exact schema:

```csv
recipientName,occasion,message,senderName
John Doe,Birthday,Wishing you success,DXSO Team
Jane Smith,Anniversary,Congratulations on your special day,Marketing Team
Alice Johnson,Birthday,Happy Birthday! Hope your day is filled with joy,HR Department
```

**Example CSV Content:**
```csv
recipientName,occasion,message,senderName
John Doe,Birthday,Wishing you success,DXSO Team
Jane Smith,Anniversary,Congratulations on your special day,Marketing Team
```

### Field Descriptions

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `recipientName` | string | Yes | Not empty | Name of the person receiving the greeting |
| `occasion` | string | Yes | Not empty | Type of occasion (e.g., Birthday, Anniversary) |
| `message` | string | Yes | Not empty, max 300 characters | Personalized message text |
| `senderName` | string | Yes | Not empty | Name of the person/organization sending the greeting |

---

## Validation Rules

### A. Request-Level Validation

Before processing the CSV content, the API validates:

1. **File Exists**
   - File must be provided in the request
   - Error: `400 Bad Request - No file uploaded`

2. **File Type**
   - File extension must be `.csv`
   - Error: `400 Bad Request - File must be a CSV file`

3. **File Size**
   - Maximum file size: 50MB
   - Error: `400 Bad Request - File size exceeds maximum limit of 50MB`

4. **File Content**
   - File must not be empty
   - Error: `400 Bad Request - File is empty`

### B. CSV-Level Validation

After parsing the CSV:

1. **Required Headers**
   - All required headers must be present
   - Headers are case-sensitive
   - Error: `400 Bad Request - Missing required headers: [header1], [header2]`

2. **Data Rows**
   - At least 1 data row must exist (excluding header)
   - Error: `400 Bad Request - CSV file is empty or has no data rows`

### C. Row-Level Validation

For each row in the CSV:

1. **Template Validation**
   - `templateId` must exist in the database
   - Template status must be `ACTIVE`
   - Error: `404 Not Found - Template with templateId "[id]" not found`
   - Error: `400 Bad Request - Template "[id]" is not ACTIVE (status: [status])`

2. **Required Fields**
   - All required fields must have non-empty values
   - Error: `400 Bad Request - Row [number]: Missing required fields: [field1], [field2]`

3. **Message Length**
   - Message must not exceed 300 characters
   - Error: `400 Bad Request - Row [number]: Message exceeds maximum length of 300 characters`

4. **Text Area Mapping**
   - Text area IDs must exactly match CSV column names
   - No fuzzy or partial matching is performed
   - If a text area ID doesn't match a CSV column, it is skipped (no error)
   - Error: None (text areas without matching CSV fields are simply not rendered)

### Processing Behavior

**Fail-Fast Strategy:**
- If any row fails validation, the entire request fails immediately
- No partial processing is performed
- All validation errors are returned in the error response
- Response status is either `SUCCESS` or `FAILED` (no `PARTIAL` state)

---

## Response

### Success Response (200 OK)

```json
{
  "status": "SUCCESS",
  "total": 10,
  "generated": 10,
  "results": [
    {
      "row": 1,
      "templateId": "sample_01",
      "images": [
        {
          "width": 1200,
          "height": 675,
          "url": "https://cdn.cloudflare.com/greetings/sample_01_1_1200x675.png"
        },
        {
          "width": 1600,
          "height": 900,
          "url": "https://cdn.cloudflare.com/greetings/sample_01_1_1600x900.png"
        },
        {
          "width": 1920,
          "height": 1080,
          "url": "https://cdn.cloudflare.com/greetings/sample_01_1_1920x1080.png"
        }
      ]
    },
    {
      "row": 2,
      "templateId": "sample_01",
      "images": [
        {
          "width": 1200,
          "height": 675,
          "url": "https://cdn.cloudflare.com/greetings/sample_01_2_1200x675.png"
        },
        {
          "width": 1600,
          "height": 900,
          "url": "https://cdn.cloudflare.com/greetings/sample_01_2_1600x900.png"
        },
        {
          "width": 1920,
          "height": 1080,
          "url": "https://cdn.cloudflare.com/greetings/sample_01_2_1920x1080.png"
        }
      ]
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Processing status: `SUCCESS` or `FAILED` |
| `total` | number | Total number of rows in the CSV file |
| `generated` | number | Number of greeting images successfully generated |
| `results` | array | Array of generated greeting results |

### Result Object

| Field | Type | Description |
|-------|------|-------------|
| `row` | number | Row number from the CSV (1-indexed) |
| `templateId` | string | Template ID used for this greeting |
| `images` | array | Array of generated image objects (see Image Object) |

### Image Object

| Field | Type | Description |
|-------|------|-------------|
| `width` | number | Image width in pixels |
| `height` | number | Image height in pixels |
| `url` | string | URL to the generated image |

**Important:** All images in the array maintain the template's orientation. A landscape template will only generate landscape images at different resolutions. A portrait template will only generate portrait images. A square template will only generate square images.

### Error Responses

#### 400 Bad Request - File Validation Error
```json
{
  "statusCode": 400,
  "message": "File must be a CSV file",
  "error": "Bad Request"
}
```

#### 400 Bad Request - CSV Parsing Error
```json
{
  "statusCode": 400,
  "message": "Failed to parse CSV: [error details]",
  "error": "Bad Request"
}
```

#### 400 Bad Request - Missing Headers
```json
{
  "statusCode": 400,
  "message": "Missing required headers: templateId, recipientName",
  "error": "Bad Request"
}
```

#### 400 Bad Request - Row Validation Error
```json
{
  "statusCode": 400,
  "message": "Row 3: Missing required fields: message, senderName",
  "error": "Bad Request"
}
```

#### 404 Not Found - Template Not Found
```json
{
  "statusCode": 404,
  "message": "Template with templateId \"invalid_template\" not found",
  "error": "Not Found"
}
```

#### 400 Bad Request - Template Not Active
```json
{
  "statusCode": 400,
  "message": "Template \"sample_01\" is not ACTIVE (status: INACTIVE)",
  "error": "Bad Request"
}
```

#### 400 Bad Request - Processing Error
```json
{
  "statusCode": 400,
  "message": "Failed to process row 5: [error details]",
  "error": "Bad Request"
}
```

---

## Processing Flow

### Step 1: Receive CSV File
- Controller receives the file via `multipart/form-data`
- File is passed to the service layer

### Step 2: Parse CSV
- CSV file is parsed into an array of row objects
- Headers are validated
- Each row is validated for required fields

### Step 3: Load Template
- The specified template is loaded from MongoDB using the provided templateId

### Step 4: Validate Template
- The specified template is validated:
  - Template exists
  - Template status is `ACTIVE`

### Step 5: Process Each Row

For each row in the CSV:

#### a) Load Template
- Template JSON is fetched from MongoDB
- Includes: canvas dimensions, background image URL, text areas configuration, orientation

#### b) Download Background Image
- Background image is downloaded from Cloudflare R2 URL
- Image is loaded into memory for processing

#### c) Render Text
- For each text area in the template:
  - **Exact Match Mapping**: Text area ID must exactly match CSV column name
    - `textArea.id === "recipientName"` → maps to `recipientName` CSV field
    - `textArea.id === "message"` → maps to `message` CSV field
    - No fuzzy matching or partial matching
    - If no match, text area is skipped (no error)
  - Text is rendered onto the image using SVG overlays
  - Font size is calculated to fit within text area bounds (between minFontSize and maxFontSize)
  - Text alignment is applied (left, center, right) as specified in template

#### d) Generate Base Image
- Base image is generated with all text rendered
- Image is saved in memory

#### e) Generate Multiple Resolutions (Same Orientation)
From the base image, multiple resolutions are generated **in the template's orientation only**:

**Standard Resolutions Generated:**
1. **Original Size**: Template's canvas dimensions
2. **High Resolution**: 1600px width (height calculated proportionally)
3. **Full HD**: 1920px width (height calculated proportionally)

**Critical Rule:**
- A landscape template (width > height) generates only landscape images
- A portrait template (height > width) generates only portrait images
- A square template (width ≈ height) generates only square images
- **Never** generates images in a different orientation
- All images maintain the exact aspect ratio of the template

#### f) Upload Generated Images
- Each generated image is uploaded to Cloudflare R2
- File naming: `{templateId}_{rowNumber}_{width}x{height}.png`
- Public or signed URLs are obtained for each image

### Step 6: Store Greeting Records
- Each greeting is stored in MongoDB (`greetings` collection)
- Stored data includes:
  - Input data (templateId, recipientName, occasion, message, senderName)
  - Generated image URLs with dimensions
  - Row number
  - Timestamps (createdAt, updatedAt)

### Step 7: Build Response
- Response is constructed with:
  - Total records processed
  - Success count (equals total if successful)
  - Generated image URLs for each row
  - Status: `SUCCESS` (if all rows processed) or `FAILED` (if any error occurred)

---

## Text Area Mapping

### Exact Match Only

The API uses **exact match** mapping between text area IDs and CSV column names:

**Mapping Rules:**
- Text area ID must exactly match CSV column name (case-sensitive)
- No fuzzy matching
- No partial matching
- No keyword detection

**Example:**
```json
{
  "textAreas": [
    { "id": "recipientName", ... },  // ✅ Maps to recipientName CSV column
    { "id": "message", ... },         // ✅ Maps to message CSV column
    { "id": "customField", ... }      // ❌ No match - skipped (no error)
  ]
}
```

**CSV Columns:**
```csv
recipientName,occasion,message,senderName
```

**Result:**
- `recipientName` text area → renders `recipientName` from CSV
- `message` text area → renders `message` from CSV
- `customField` text area → skipped (no matching CSV column)

This ensures:
- ✅ Deterministic behavior
- ✅ No silent mismatches
- ✅ Easy debugging
- ✅ Predictable results

---

## Image Generation Details

### Orientation Rule (Critical)

**A template generates only images in its own orientation.**

**Examples:**

#### Landscape Template
```json
{
  "orientation": "landscape",
  "canvas": { "width": 1200, "height": 675 }
}
```

**Valid Outputs:**
- 1200×675 (original)
- 1600×900 (high res)
- 1920×1080 (full HD)

**Invalid Outputs:**
- 1080×1080 ❌ (square)
- 1080×1350 ❌ (portrait)

#### Portrait Template
```json
{
  "orientation": "portrait",
  "canvas": { "width": 800, "height": 1200 }
}
```

**Valid Outputs:**
- 800×1200 (original)
- 1067×1600 (high res)
- 1280×1920 (full HD)

**Invalid Outputs:**
- 1200×1200 ❌ (square)
- 1920×1080 ❌ (landscape)

#### Square Template
```json
{
  "orientation": "square",
  "canvas": { "width": 1080, "height": 1080 }
}
```

**Valid Outputs:**
- 1080×1080 (original)
- 1600×1600 (high res)
- 1920×1920 (full HD)

**Invalid Outputs:**
- 1920×1080 ❌ (landscape)
- 1080×1350 ❌ (portrait)

### Text Rendering

- Text is rendered using SVG overlays (via Sharp library)
- Font size is automatically calculated to fit within text area bounds
- Font size is constrained between `minFontSize` and `maxFontSize` (from template)
- Text alignment is applied based on template configuration (left, center, right)
- Text color matches the template's `fontColor` setting
- Font family is applied from template's `fontFamily` setting

### Resolution Generation

Images are generated in multiple resolutions based on the template's original dimensions:

1. **Original Size**: Template's canvas dimensions (exact)
2. **High Resolution**: 1600px width (height calculated to maintain aspect ratio)
3. **Full HD**: 1920px width (height calculated to maintain aspect ratio)

**Important Notes:**
- Images are never rotated or stretched
- Only proportional scaling is applied
- Original aspect ratio is always maintained
- All generated images share the same orientation as the template

---

## Database Storage

Each successfully processed greeting is stored in MongoDB with the following structure:

```json
{
  "_id": "ObjectId(...)",
  "templateId": "sample_01",
  "recipientName": "John Doe",
  "occasion": "Birthday",
  "message": "Wishing you success",
  "senderName": "DXSO Team",
  "imageUrls": [
    {
      "width": 1200,
      "height": 675,
      "url": "https://cdn.cloudflare.com/greetings/sample_01_1_1200x675.png"
    },
    {
      "width": 1600,
      "height": 900,
      "url": "https://cdn.cloudflare.com/greetings/sample_01_1_1600x900.png"
    },
    {
      "width": 1920,
      "height": 1080,
      "url": "https://cdn.cloudflare.com/greetings/sample_01_1_1920x1080.png"
    }
  ],
  "rowNumber": 1,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Collection:** `greetings`

---

## Examples

### Example 1: cURL Request

```bash
curl -X POST http://localhost:3000/api/greetings/bulk \
  -F "file=@greetings.csv" \
  -F "templateId=sample_01"
```

### Example 2: JavaScript/TypeScript (FormData)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('templateId', 'sample_01');

const response = await fetch('http://localhost:3000/api/greetings/bulk', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data);
```

### Example 3: Node.js (FormData)

```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const formData = new FormData();
formData.append('file', fs.createReadStream('greetings.csv'));
formData.append('templateId', 'sample_01');

const response = await axios.post(
  'http://localhost:3000/api/greetings/bulk',
  formData,
  {
    headers: formData.getHeaders()
  }
);

console.log(response.data);
```

### Example 4: Python (requests)

```python
import requests

url = 'http://localhost:3000/api/greetings/bulk'

with open('greetings.csv', 'rb') as f:
    files = {'file': ('greetings.csv', f, 'text/csv')}
    data = {'templateId': 'sample_01'}
    response = requests.post(url, files=files, data=data)

print(response.json())
```

### Example CSV File

Create a file named `greetings.csv`:

```csv
recipientName,occasion,message,senderName
John Doe,Birthday,Wishing you a wonderful birthday filled with joy and happiness,DXSO Team
Jane Smith,Anniversary,Congratulations on your special anniversary. May you have many more years of happiness together,Marketing Team
Alice Johnson,Birthday,Happy Birthday! Hope your day is filled with joy and laughter,HR Department
Bob Williams,Graduation,Congratulations on your graduation! Wishing you success in all your future endeavors,Academic Team
```

---

## Performance Considerations

### Optimization Features

1. **Template Grouping**
   - Rows are grouped by `templateId` before processing
   - Each template is loaded from the database only once
   - Reduces database queries significantly

2. **Fail-Fast Processing**
   - Processing stops on first error
   - No wasted processing on invalid data
   - Fast feedback for validation errors

### Processing Time

- **Small files (< 10 rows)**: ~2-5 seconds
- **Medium files (10-50 rows)**: ~10-30 seconds
- **Large files (50-100 rows)**: ~30-60 seconds

Processing time depends on:
- Number of rows
- Template complexity
- Image download speed
- Cloudflare R2 upload speed

---

## Error Handling

### Fail-Fast Strategy

The API uses a **fail-fast** approach:
- If any row fails validation, processing stops immediately
- No partial results are returned
- Error message indicates which row failed and why
- Response status is either `SUCCESS` or `FAILED` (no `PARTIAL` state)

### Common Error Scenarios

1. **Invalid CSV Format**
   - Missing headers
   - Malformed CSV structure
   - Empty file

2. **Template Issues**
   - Template not found
   - Template not active
   - Invalid template configuration

3. **Image Processing Errors**
   - Background image download failure
   - Image generation failure
   - Cloudflare R2 upload failure

4. **Validation Errors**
   - Missing required fields
   - Message too long
   - Invalid data format

---

## Best Practices

### CSV File Preparation

1. **Use UTF-8 Encoding**
   - Ensure CSV file is saved with UTF-8 encoding
   - Avoid special characters that may cause parsing issues

2. **Validate Before Upload**
   - Check that all required fields are present
   - Verify message length (≤ 300 characters)
   - Ensure template IDs exist and are active

3. **Batch Size**
   - Recommended: 50-100 rows per file
   - Large files may timeout (consider splitting)

4. **Template IDs**
   - Verify template IDs before creating CSV
   - Use `GET /api/templates` to get available templates

5. **Text Area IDs**
   - Ensure text area IDs in templates exactly match CSV column names
   - No fuzzy matching - exact match required

### Error Handling

1. **Always Check Response Status**
   - Check HTTP status code before processing response
   - Handle both success and error responses

2. **Validate Response Data**
   - Verify `status` field in response
   - Check `generated` count matches expectations
   - With fail-fast, `generated` will equal `total` on success

3. **Retry Logic**
   - Implement retry for transient errors (network issues)
   - Don't retry validation errors (fix CSV first)

---

## Limitations

1. **File Size**: Maximum 50MB
2. **Message Length**: Maximum 300 characters
3. **Processing**: Sequential (one row at a time)
4. **Text Rendering**: SVG text overlays (basic typography)
5. **Image Formats**: Only PNG output supported
6. **Template Status**: Only ACTIVE templates can be used
7. **Text Area Mapping**: Exact match only (no fuzzy matching)
8. **Orientation**: Templates generate only images in their own orientation

---

## Future Enhancements

1. **Parallel Processing**: Process multiple rows simultaneously
2. **Progress Tracking**: WebSocket or polling for progress updates
3. **Batch Status**: Check status of previously submitted batches
4. **Advanced Text Rendering**: Support for custom fonts, text wrapping, multi-line
5. **Image Formats**: Support for JPEG, WEBP output
6. **Partial Success**: Option to continue processing after errors (v2)
7. **Template Preview**: Preview template before bulk generation
8. **Custom Resolutions**: Allow specifying custom output resolutions

---

## Support

For issues or questions:
- Check error messages for specific validation failures
- Verify CSV format matches the required schema
- Ensure templates exist and are active
- Verify text area IDs match CSV column names exactly
- Check Cloudflare R2 configuration

---

## Changelog

### Version 1.0.0 (Current)
- Initial release
- CSV file upload support
- Bulk greeting generation
- Multiple resolution generation (same orientation)
- MongoDB storage integration
- Cloudflare R2 integration
- Fail-fast error handling
- Exact text area mapping