# Client Project Tracker

A simple tracker for a digital agency's project managers to record client projects, monitor their progress, and manage priorities.

- **Backend:** Laravel REST API with MySQL
- **Frontend:** React + TypeScript (Vite), Tailwind CSS, shadcn/ui

## Features

- List, view, create, edit, and delete projects
- Status (Planning, In Progress, On Hold, Completed) and priority (Low, Medium, High) shown as colored badges
- Validation on both the client and the server, with field-level error messages
- JSON error responses for validation failures and missing records
- Feature tests covering every endpoint and validation rule

## Assumptions

- Authentication and user roles are out of scope, since `REQUIREMENTS.md` does not mention them. Anyone who can reach the app can manage projects.
- Client name is stored as a field on the project. There is no separate `clients` table, because the spec lists it as one of the project's fields.
- `description` is optional. Every other field is required.
- Dates use the `YYYY-MM-DD` format, and a due date equal to the start date is allowed. Only an earlier due date is rejected.
- `status` and `priority` accept only the exact values listed in the spec, with the same capitalization.
- `PUT` replaces the whole project, so the client sends all required fields on every update.
- The project list is not paginated, because only a small number of projects is expected.
- Deleting a project permanently removes it (no soft delete or archive).
- The app runs locally. Deployment configuration is not included.

## Requirements

- PHP 8.2+ and Composer (with the `pdo_mysql` extension enabled)
- Node.js 18+
- MySQL 8+

## Setup

### 1. Clone

```bash
git clone https://github.com/kenjos75/client_project_tracker
cd client_project_tracker
```

### 2. Backend (Laravel)

```bash
cd server
composer install
cp .env.example .env        # Windows: copy .env.example .env
php artisan key:generate
```

Create an empty MySQL database:

```sql
CREATE DATABASE koda_client_project_tracker_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Set your credentials in `server/.env`:

```env
DB_DATABASE=koda_client_project_tracker_db
DB_USERNAME=root
DB_PASSWORD=
```

Run the migrations and start the server:

```bash
php artisan migrate
php artisan serve           # http://localhost:8000
```

### 3. Frontend (React + Vite)

In a second terminal:

```bash
cd client
npm install
npm run dev                 # http://localhost:5173
```

Start the backend first. The Vite dev server proxies requests from `/api/*` to `http://localhost:8000` and strips the `/api` prefix, so no CORS setup is needed in development.

## API

All endpoints accept and return JSON. Send the `Accept: application/json` header.

| Method | Endpoint         | Description      | Success |
|--------|------------------|------------------|---------|
| GET    | `/projects`      | Get all projects | 200     |
| GET    | `/projects/{id}` | Get one project  | 200     |
| POST   | `/projects`      | Create a project | 201     |
| PUT    | `/projects/{id}` | Update a project | 200     |
| DELETE | `/projects/{id}` | Delete a project | 204     |

### Project fields

| Field          | Type   | Rules                                                              |
|----------------|--------|--------------------------------------------------------------------|
| `id`           | int    | Generated                                                          |
| `client_name`  | string | Required, max 255                                                  |
| `project_name` | string | Required, max 255                                                  |
| `description`  | string | Optional                                                           |
| `status`       | string | Required: `Planning`, `In Progress`, `On Hold`, `Completed`        |
| `priority`     | string | Required: `Low`, `Medium`, `High`                                  |
| `start_date`   | date   | Required, format `YYYY-MM-DD`                                      |
| `due_date`     | date   | Required, format `YYYY-MM-DD`, cannot be earlier than `start_date` |

`PUT` replaces the whole resource, so all required fields must be sent.

### Example: create a project

```http
POST /projects
Content-Type: application/json
Accept: application/json

{
  "client_name": "Acme",
  "project_name": "Website Redesign",
  "description": "New marketing site",
  "status": "Planning",
  "priority": "High",
  "start_date": "2026-10-05",
  "due_date": "2026-12-01"
}
```

Response `201 Created`:

```json
{
  "id": 1,
  "client_name": "Acme",
  "project_name": "Website Redesign",
  "description": "New marketing site",
  "status": "Planning",
  "priority": "High",
  "start_date": "2026-10-05",
  "due_date": "2026-12-01",
  "created_at": "2026-10-02T08:00:00.000000Z",
  "updated_at": "2026-10-02T08:00:00.000000Z"
}
```

### Error responses

Validation failure, `422 Unprocessable Entity`:

```json
{
  "message": "Due date cannot be earlier than the start date.",
  "errors": {
    "due_date": ["Due date cannot be earlier than the start date."]
  }
}
```

Missing record, `404 Not Found`:

```json
{ "message": "Project not found." }
```

## Testing

Feature tests cover all five endpoints and every validation rule: required fields, invalid status and priority, due date earlier than start date, malformed dates, and 404 responses.

The tests wipe their database on every run, so they use a separate one. Create it once:

```sql
CREATE DATABASE koda_client_project_tracker_db_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run:

```bash
cd server
php artisan test
```

The test database name is set in `server/phpunit.xml`. The host and credentials are read from `server/.env`. Your development data is never touched.

## Project structure

```
client-project-tracker/
├── server/                         Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/ProjectController.php
│   │   │   └── Requests/ProjectRequest.php
│   │   └── Models/Project.php
│   ├── bootstrap/app.php           Route prefix and JSON error handling
│   ├── database/
│   │   ├── factories/ProjectFactory.php
│   │   └── migrations/             projects table
│   ├── routes/api.php
│   └── tests/Feature/ProjectApiTest.php
└── client/                         React app
    └── src/
        ├── api/                    API calls and error types
        ├── components/             App components (ProjectForm, badges)
        │   └── ui/                 shadcn/ui primitives
        ├── hooks/                  TanStack Query hooks
        ├── schemas/                Zod validation schema
        ├── constants.ts            Status and priority values
        └── types.ts                Shared TypeScript types
```

## Design decisions

- **Thin controller, Form Request, Eloquent.** The controller only handles HTTP. Validation lives in `ProjectRequest`, and the controller uses the Eloquent model directly. I did not add a repository layer because it would only forward calls to Eloquent for five CRUD operations.
- **Routes without the `/api` prefix.** The requirements specify `/projects`, so the prefix is removed in `bootstrap/app.php`. In development the frontend calls `/api/projects` and Vite strips the prefix before forwarding.
- **One `projects` table.** The spec describes a single entity with the client name as a field, so I did not normalize it into a `clients` table.
- **Enum columns** for status and priority, since the allowed values are fixed.
- **No authentication.** It is not part of the requirements.
- **Two validation layers.** Zod gives instant feedback in the form. Laravel is the source of truth, and its 422 errors are mapped onto the matching form fields, so the user sees the same message from either layer.
- **Always-JSON errors.** Validation and not-found errors return JSON, so the client never has to parse HTML.
- **React Hook Form + Zod** for the form, with the Zod schema as the single source of truth for the form's types.
- **TanStack Query** for server state. The list refetches after every create, update, or delete, so there is no manual refresh logic.
- **shadcn/ui + Tailwind** for the UI primitives and styling.
- **Layered frontend.** API calls, hooks, schemas, and components are separated so each file has one job.

## Possible improvements

- A Laravel API Resource to define the response shape explicitly
- Pagination, search, and filtering by status or priority
- Authentication with Laravel Sanctum so only project managers can access the data
- A separate `clients` table to avoid duplicated client names
- A confirmation dialog instead of the browser `confirm()` for deletes
- Frontend tests (for example, Vitest and React Testing Library)