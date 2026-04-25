# Node Clean Architecture Template

Backend template built with Express, TypeScript, PostgreSQL, and Drizzle ORM.

The project follows a pragmatic clean-architecture-by-module approach: each module keeps its own domain, application, infrastructure, and presentation layers, while shared concerns such as database wiring, common middleware, and config live outside the module.

Right now the template includes a complete auth module with:
- user registration and login
- short-lived access tokens
- rotating refresh tokens
- persisted sessions in PostgreSQL
- logout revocation
- session-aware protected routes
- Zod request validation
- optional httpOnly refresh-token cookie support with JSON fallback

## Project Overview

This repository is meant to be a reusable backend starting point for modular Node.js APIs.

It is a good fit if you want:
- Express + TypeScript without a heavy framework
- PostgreSQL with Drizzle ORM and SQL migrations
- a modular codebase that can grow feature by feature
- a production-friendly auth base without introducing an external auth provider

It is not trying to be a full framework. The current implementation is intentionally small and focused.

## Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Drizzle ORM
- Zod
- JSON Web Tokens
- bcryptjs
- ESLint 9

## Features Included Today

- Express server with typed environment configuration
- Persistence provider selection with PostgreSQL/Drizzle currently implemented
- Auth module wired through DI in `main`
- User registration and login
- Access token + refresh token flow
- Refresh token rotation
- Persisted auth sessions in PostgreSQL
- Logout with session revocation
- Protected route that checks both access token and session state
- Optional refresh-token cookie support for browser clients
- JSON refresh-token fallback for API clients and Postman
- Zod validation in the presentation layer
- Drizzle migration files already included

## Architecture

The repository uses four main areas under `src`:

- `config`
  Shared runtime/config helpers such as env parsing, JWT helpers, bcrypt adapter, and generic validators.

- `main`
  App composition layer. This is where routes are mounted, dependencies are wired together, and provider bootstrap/factories live.

- `modules`
  Business features. Right now the template includes one module: `auth`.

- `shared`
  Shared infrastructure and cross-cutting code such as provider-specific database wiring, common middleware, error helpers, type augmentation, and utility helpers.

### Auth Module Structure

The current auth module follows this structure:

- `domain`
  Contracts and entities. In auth this includes user/session entities plus datasource and repository contracts.

- `application`
  DTOs and use-cases. In auth this includes login, register, refresh, logout, and get-user-by-id flows.

- `infrastructure`
  Concrete implementations. In auth this includes PostgreSQL/Drizzle persistence, mappers, and repository/datasource implementations.

- `presentation`
  Express-facing layer. In auth this includes routes, controller, middleware, validators, and refresh-cookie helpers.

This keeps route/controller concerns out of persistence code, while still staying simple enough to extend without a lot of ceremony.

## Folder Structure

```text
src/
  app.ts
  config/
  main/
    bootstrap/
    di/
    factories/
    routes.ts
    server.ts
  modules/
    auth/
      application/
        dtos/
        use-cases/
      domain/
        datasources/
        entities/
        repositories/
      infrastructure/
        mappers/
        repositories/
        persistence/
          postgres/
      presentation/
        helpers/
        middlewares/
        validators/
        controller.ts
        routes.ts
  shared/
    errors/
    helpers/
    infrastructure/
      database/
        postgres/
    presentation/
      middlewares/
    types/
```

## Authentication Flow

The current auth implementation works like this:

### Access Token

- JWT with a short expiration
- signed with `JWT_SEED`
- payload contains:
  - `sub`
  - `sessionId`
  - `type: 'access'`
- returned in JSON
- used in protected routes with `Authorization: Bearer <token>`

### Refresh Token

- JWT with a longer expiration
- signed with `JWT_REFRESH_SEED`
- payload contains:
  - `sub`
  - `sessionId`
  - `type: 'refresh'`
- rotated on refresh
- persisted indirectly through a hashed value stored in the session table

### Sessions

Each login/register creates a row in `auth_sessions`.

That session stores:
- session id
- user id
- refresh token hash
- expiration
- revocation timestamp
- optional user agent and IP
- timestamps

Protected routes do not only validate the access token. They also verify that the referenced session still exists, is not revoked, and is not expired.

### Logout

`POST /api/auth/logout` revokes the current session in PostgreSQL.

After logout:
- refresh can no longer be used for that session
- protected routes using the same access token also fail because session state is checked server-side

## Refresh Token Transport

There is only one refresh/session logic in the codebase. The difference is only how the refresh token is transported.

### Cookie-First for Web

For browser clients:
- login/register set the refresh token as an httpOnly cookie
- refresh reads the cookie first
- refresh rotates the cookie after issuing a new refresh token
- logout clears the cookie

Cookie options are controlled by env vars:
- `AUTH_REFRESH_COOKIE_NAME`
- `AUTH_REFRESH_COOKIE_SECURE`
- `AUTH_REFRESH_COOKIE_SAME_SITE`
- `AUTH_REFRESH_COOKIE_PATH`

### JSON Fallback for API Clients

For Postman or non-cookie clients:
- refresh still accepts `refreshToken` in the JSON body
- login/register still return `refreshToken` in JSON for compatibility

Refresh priority is:
1. cookie refresh token
2. `req.body.refreshToken`

This means browser clients can be cookie-first, while manual/API clients still work without a second auth flow.

## Persistence Providers

The application depends on business contracts such as `AuthDatasource`, not on PostgreSQL, Drizzle, MongoDB, or any other provider directly.

Right now the implemented auth provider is:
- `AUTH_DATABASE_PROVIDER=postgres`

Provider-specific selection happens in:
- `src/main/bootstrap/database.ts`
- `src/main/factories/auth-datasource.factory.ts`

This means:
- controllers, routes, use-cases, and domain entities do not switch providers directly
- PostgreSQL/Drizzle stays inside infrastructure
- adding MongoDB or SQLite later means creating a new datasource implementation that satisfies the same domain contract
- future modules can introduce their own provider envs and factories without changing auth

## Database and Drizzle Workflow

The project uses Drizzle ORM with schema files in code and SQL migrations in the `drizzle/` folder.

Current auth-related tables:
- `users`
- `auth_sessions`

Relevant files:
- `src/modules/auth/infrastructure/persistence/postgres/user.schema.ts`
- `src/modules/auth/infrastructure/persistence/postgres/auth-session.schema.ts`
- `src/shared/infrastructure/database/postgres/schema.ts`

### Current Migration Files

The repo already includes migrations for:
- initial `users` table
- `auth_sessions`
- UUID type migration for auth-related ids

### Typical Drizzle Commands

- `npm run db:generate`
  Generates a new SQL migration from the current schema.

- `npm run db:migrate`
  Applies migrations to the configured PostgreSQL database.

- `npm run db:push`
  Pushes schema changes directly without creating a migration first.

- `npm run db:studio`
  Opens Drizzle Studio.

Recommended workflow for template development:
1. Update schema files
2. Run `npm run db:generate`
3. Review generated SQL
4. Run `npm run db:migrate`

## Environment Variables

Copy `.env.template` to `.env` and adjust the values for your setup.

Current variables:

```env
PORT=3000
AUTH_DATABASE_PROVIDER=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_db
JWT_SEED=
JWT_REFRESH_SEED=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
AUTH_REFRESH_COOKIE_NAME=refreshToken
AUTH_REFRESH_COOKIE_SECURE=false
AUTH_REFRESH_COOKIE_SAME_SITE=lax
AUTH_REFRESH_COOKIE_PATH=/api/auth
```

Notes:
- `AUTH_DATABASE_PROVIDER` is the preferred explicit setting for auth going forward.
- Resolution order is:
  1. `AUTH_DATABASE_PROVIDER`
  2. `DATABASE_PROVIDER` as a backward-compatible fallback
  3. `postgres` as the default
- `DATABASE_PROVIDER` is still supported as a legacy/global fallback for backward compatibility.
- In production, set `AUTH_DATABASE_PROVIDER=postgres` explicitly instead of relying on the default.
- `JWT_REFRESH_SEED` falls back to `JWT_SEED` if not set, but using a dedicated refresh secret is recommended.
- In production, `AUTH_REFRESH_COOKIE_SECURE` should normally be `true`.
- If you use `AUTH_REFRESH_COOKIE_SAME_SITE=none`, you should also use HTTPS.
- Make sure `DATABASE_URL` matches your actual PostgreSQL credentials.

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.template .env
```

Then update `.env` with your real auth provider setting, PostgreSQL credentials, and JWT secrets.

### 3. Start PostgreSQL

The repo includes a `docker-compose.yml` with PostgreSQL.

```bash
docker-compose up -d
```

Make sure your `DATABASE_URL` matches the PostgreSQL instance you are actually running locally.

### 4. Apply Migrations

```bash
npm run db:migrate
```

### 5. Run the App

```bash
npm run dev
```

The app starts from `src/app.ts`, selects the configured auth provider bootstrap, connects to PostgreSQL when the resolved auth provider is `postgres`, and then boots the Express server.

## Available Scripts

- `npm run dev`
  Runs the app in development with auto-restart.

- `npm run build`
  Compiles TypeScript into `dist`.

- `npm run start`
  Builds and starts the compiled app.

- `npm run lint`
  Runs ESLint.

- `npm run lint:fix`
  Runs ESLint with automatic fixes where possible.

- `npm run db:generate`
  Generates a Drizzle migration from the schema.

- `npm run db:migrate`
  Applies Drizzle migrations.

- `npm run db:push`
  Pushes schema changes directly to the DB.

- `npm run db:studio`
  Opens Drizzle Studio.

## API Endpoints Available Today

Base path: `/api/auth`

### `POST /api/auth/register`

Request body:

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "token": "<accessToken>",
  "accessToken": "<accessToken>",
  "refreshToken": "<refreshToken>",
  "user": {
    "id": "<userId>",
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

### `POST /api/auth/login`

Request body:

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "token": "<accessToken>",
  "accessToken": "<accessToken>",
  "refreshToken": "<refreshToken>",
  "user": {
    "id": "<userId>",
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

### `POST /api/auth/refresh`

Cookie-first mode:
- send the refresh cookie
- no body required

JSON fallback mode:

```json
{
  "refreshToken": "<refreshToken>"
}
```

Response:

```json
{
  "token": "<newAccessToken>",
  "accessToken": "<newAccessToken>",
  "refreshToken": "<newRefreshToken>",
  "user": {
    "id": "<userId>",
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

### `POST /api/auth/logout`

Headers:

```http
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "message": "Session closed successfully"
}
```

### `GET /api/auth/`

Headers:

```http
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "user": {
    "id": "<userId>",
    "name": "John Doe",
    "email": "user@example.com",
    "role": ["USER_ROLE"]
  }
}
```

## Validation

Validation is handled in the presentation layer with Zod.

Current pattern:
- module-level schemas live in `presentation/validators`
- a shared middleware parses and validates `req.body`
- controllers receive already-validated data

In auth this is used for:
- register
- login
- refresh body fallback

## Sessions and Revocation Notes

- Every login/register creates a persisted session
- Refresh rotates the refresh token and updates the session record
- Logout revokes the current session
- Protected routes verify both the access token and the underlying session
- Revoked or expired sessions make access fail even if the JWT has not expired yet

## Extending the Template

When adding a new module, follow the same practical pattern:

1. Create a new folder under `src/modules/<module-name>`
2. Split it into:
   - `domain`
   - `application`
   - `infrastructure`
   - `presentation`
3. Keep request validation in `presentation/validators`
4. Keep Express controllers thin
5. Add repository/datasource contracts in `domain`
6. Implement infrastructure details under the module, not in `main`
7. Wire the module in `src/main/di` and mount it from `src/main/routes.ts`

This keeps features isolated and makes the template easier to scale module by module.

## Development Notes

- The current implementation is focused on auth first; there are no additional business modules yet.
- Cookie-first refresh is ready for browser clients, but cross-origin frontend setups will still need proper CORS configuration with credentials.
- The template is intentionally simple, so some production concerns like logging, rate limiting, and CORS policy are not yet built in.
