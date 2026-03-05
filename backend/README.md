# Backend Service (Unicommerce)

A minimal Node.js backend using Express, Prisma ORM with PostgreSQL, Redis for caching/queues, and BullMQ for job processing.

## Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file (see `.env` template) with your `DATABASE_URL`, `REDIS_HOST`, and `REDIS_PORT`.

3. Initialize Prisma:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. (Optional) Seed initial data:
   ```bash
   npm run seed
   ```

## Running

- Development server (with nodemon):
  ```bash
  npm run dev
  ```

- Start worker in a separate shell:
  ```bash
  node src/worker.js
  ```

## Endpoints

- `GET /` – health check
- `POST /users` – create a user (expects JSON `{ email, name }`)
- `POST /jobs` – enqueue a job with arbitrary payload


## Notes

- `src/index.js` exports `prisma`, `redis`, and `jobQueue` if you need to reuse them elsewhere.
- Adjust `schema.prisma` models as your data requirements grow.
