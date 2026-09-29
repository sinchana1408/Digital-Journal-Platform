# LumaJournal — REST API Documentation

Base URL: `http://localhost:5000/api` (or proxied via Vite `/api`)

All protected routes require an HTTP Bearer JWT token in the `Authorization` header:
```http
Authorization: Bearer <jwt-token>
```
or an active HTTP-only cookie `lumajournal_token`.

---

## 1. Authentication Endpoints

### Register
* **POST** `/auth/register`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "name": "Alex Mercer",
    "email": "alex@lumajournal.com",
    "password": "Password123",
    "confirmPassword": "Password123"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "uuid-here",
      "name": "Alex Mercer",
      "email": "alex@lumajournal.com",
      "timezone": "UTC",
      "createdAt": "2026-09-29T00:00:00.000Z"
    },
    "token": "jwt-token-string"
  }
  ```
* **Error Response (400 Bad Request / 409 Conflict)**:
  ```json
  {
    "success": false,
    "error": "Email is already registered"
  }
  ```

---

### Login
* **POST** `/auth/login`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "alex@lumajournal.com",
    "password": "Password123",
    "rememberMe": true
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": { ... },
    "token": "jwt-token-string"
  }
  ```

---

### Logout
* **POST** `/auth/logout`
* **Access**: Protected
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

### Current User (Me)
* **GET** `/auth/me`
* **Access**: Protected
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "uuid-here",
      "name": "Alex Mercer",
      "email": "alex@lumajournal.com",
      "avatar": null,
      "bio": "Reflective writer and avid reader.",
      "timezone": "America/New_York",
      "createdAt": "2026-09-01T10:00:00.000Z"
    }
  }
  ```

---

### Forgot Password
* **POST** `/auth/forgot-password`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "alex@lumajournal.com"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Password reset instructions sent (or token generated in development mode)",
    "resetToken": "sample-reset-token-for-dev"
  }
  ```

---

### Reset Password
* **POST** `/auth/reset-password`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "token": "valid-reset-token",
    "password": "NewPassword123",
    "confirmPassword": "NewPassword123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Password has been successfully updated"
  }
  ```

---

## 2. Journal Entry Endpoints

### List Entries
* **GET** `/entries`
* **Access**: Protected
* **Query Parameters**:
  * `search` (string): Search term in title, content, or tags
  * `mood` (string): Filter by mood key (e.g. `calm`, `excellent`)
  * `tags` (string): Comma-separated tag names
  * `status` (string): `all` | `favorites` | `pinned` | `archived` | `drafts` (default: `all`)
  * `startDate` (ISO string / YYYY-MM-DD): Filter after this date
  * `endDate` (ISO string / YYYY-MM-DD): Filter before this date
  * `sortBy` (string): `createdAt` | `updatedAt` | `title` | `wordCount`
  * `sortOrder` (string): `desc` | `asc`
  * `page` (number): Page number (default: 1)
  * `limit` (number): Items per page (default: 12)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "entry-uuid",
        "title": "A serene walk in the rain",
        "content": "<p>Today the rain washed over the city...</p>",
        "excerpt": "Today the rain washed over the city...",
        "mood": "calm",
        "moodScore": 4,
        "isFavorite": true,
        "isPinned": false,
        "isArchived": false,
        "isDraft": false,
        "wordCount": 185,
        "readingTime": 1,
        "createdAt": "2026-09-28T14:32:00.000Z",
        "updatedAt": "2026-09-28T14:35:00.000Z",
        "tags": [{ "id": "t1", "name": "reflection" }]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 45,
      "totalPages": 4
    }
  }
  ```

---

### Create Entry
* **POST** `/entries`
* **Access**: Protected
* **Request Body**:
  ```json
  {
    "title": "Morning Thoughts",
    "content": "Woke up feeling refreshed...",
    "mood": "good",
    "tags": ["morning", "productivity"],
    "isFavorite": false,
    "isPinned": false,
    "isDraft": false
  }
  ```
* **Success Response (201 Created)**: Returns the newly created entry.

---

### Get Entry by ID
* **GET** `/entries/:id`
* **Access**: Protected
* **Success Response (200 OK)**: Returns the single entry object.

---

### Update Entry (including Autosave)
* **PUT** `/entries/:id`
* **Access**: Protected
* **Request Body**: Partial entry fields (`title`, `content`, `mood`, `tags`, `isDraft`, etc.)
* **Success Response (200 OK)**: Returns the updated entry. Also emits real-time `entry:saved` and `stats:updated` socket events.

---

### Delete Entry
* **DELETE** `/entries/:id`
* **Access**: Protected
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Entry deleted successfully"
  }
  ```

---

### Toggle Favorite
* **POST** `/entries/:id/favorite`
* **Access**: Protected
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "isFavorite": true
  }
  ```

---

### Toggle Pin
* **POST** `/entries/:id/pin`
* **Access**: Protected
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "isPinned": true
  }
  ```

---

### Toggle Archive
* **POST** `/entries/:id/archive`
* **Access**: Protected
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "isArchived": true
  }
  ```

---

## 3. Tag Management Endpoints

* **GET** `/tags`: Retrieve all tags for the authenticated user with entry count.
* **POST** `/tags`: Create a new tag `{ "name": "creativity" }`.
* **PUT** `/tags/:id`: Rename a tag `{ "name": "creative-flow" }`.
* **DELETE** `/tags/:id`: Delete a tag and remove associations.

---

## 4. Calendar & Insights Endpoints

### Calendar View
* **GET** `/calendar?year=2026&month=9`
* **Access**: Protected
* **Success Response (200 OK)**:
  Returns days of the requested month with an indicator of whether entries exist, entry count, moods recorded, and entry previews.

### Dashboard Insights
* **GET** `/insights`
* **Access**: Protected
* **Success Response (200 OK)**:
  Returns calculated writing statistics (total entries, total words, avg words, longest entry, current streak, longest streak, monthly comparison), mood distribution percentages, monthly activity timeline, and top tags.

---

## 5. Daily Mood Endpoints

* **GET** `/moods`: Get recent daily mood logs.
* **POST** `/moods`: Log today's mood `{ "mood": "calm", "score": 4, "note": "Quiet morning", "date": "2026-09-29" }`.

---

## 6. Profile & Settings Endpoints

* **GET** `/profile`: Get current profile details.
* **PUT** `/profile`: Update name, bio, timezone, avatar.
* **PUT** `/profile/password`: Change account password.
* **POST** `/profile/avatar`: Upload custom avatar image.

---

## 7. Data Export & Import Endpoints

* **GET** `/export`: Downloads a complete JSON archive of all entries, tags, and mood logs.
* **POST** `/import`: Uploads and imports entries from a JSON file.
