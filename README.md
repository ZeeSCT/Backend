# Scientechnic NestJS Backend

Modular NestJS backend for the Scientechnic project management dashboard.

## Included

- Auth login/register with JWT
- PostgreSQL database
- Prisma 7.x with `prisma.config.ts`
- Prisma PostgreSQL adapter
- Swagger API documentation
- Portfolio overview APIs
- Projects, Tenders, Planning, QA/QC, Procurement, and Maintenance modules

## Requirements

- Node.js
- npm
- PostgreSQL
- Valid PostgreSQL connection URL

## Project Structure

```text
backend/
  package.json
  .env
  .env.example
  prisma.config.ts
  prisma/
    schema.prisma
    seed.ts
    migrations/
  src/
    common/
      prisma/
        prisma.service.ts
    modules/
    main.ts
    app.module.ts
```

## Environment Setup

Create `.env`:

```cmd
copy .env.example .env
```

Example `.env`:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/scientechnic_dashboard?schema=public"
JWT_SECRET="your_jwt_secret"
PORT=3001
```

If your database password contains special characters like `@`, encode them.

Example:

```text
Admin@123 -> Admin%40123
```

## Install Dependencies

```cmd
npm install
```

If Prisma packages are missing:

```cmd
npm install -D prisma tsx
npm install @prisma/client @prisma/adapter-pg pg dotenv
npm install -D @types/pg
```

## Prisma Config

`prisma.config.ts` must be in the backend root, beside `package.json`.

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },

  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

## Prisma Service

`src/common/prisma/prisma.service.ts`

```ts
import "dotenv/config";

import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing. Check your .env file.");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

## First-Time Setup

```cmd
copy .env.example .env
npm install
set NODE_TLS_REJECT_UNAUTHORIZED=0
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

## Useful Commands

Generate Prisma Client:

```cmd
npx prisma generate
```

Run migration:

```cmd
npx prisma migrate dev --name update_schema
```

Seed database:

```cmd
npx prisma db seed
```

Open Prisma Studio:

```cmd
npx prisma studio
```

Start development server:

```cmd
npm run start:dev
```

Build project:

```cmd
npm run build
```

Run production build:

```cmd
npm run start:prod
```

## API URLs

Backend:

```text
http://localhost:3001
```

Swagger:

```text
http://localhost:3001/api/docs
```

Portfolio overview examples:

```text
http://localhost:3001/portfolio-overview?category=all
http://localhost:3001/portfolio-overview?category=its
http://localhost:3001/portfolio-overview?category=traffic
http://localhost:3001/portfolio-overview?category=its-maint
http://localhost:3001/portfolio-overview?category=traffic-maint
```

## Seed Login

```text
Email: admin@example.com
Password: seed-password-hash
```

Update this once real password hashing is configured.

## Portfolio Categories

The system uses these portfolio category codes:

```text
its
traffic
its-maint
traffic-maint
```

These values must match the frontend dropdown values.

## Common Issues

### Prisma Client not found

Run:

```cmd
npx prisma generate
```

Then restart the backend.

### Database schema does not match Prisma schema

Run:

```cmd
npx prisma migrate dev --name update_schema
npx prisma generate
```

For local development only, you can also use:

```cmd
npx prisma db push
npx prisma generate
```

### `client password must be a string`

Check `.env`:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/scientechnic_dashboard?schema=public"
```

Make sure:

- `.env` is in the backend root
- password is included
- password is URL-encoded if it contains special characters
- NestJS server was restarted after changing `.env`

### Port already in use

Find process:

```cmd
netstat -ano | findstr :3001
```

Kill process:

```cmd
taskkill /PID <PID_NUMBER> /F
```

## Windows Cleanup

```cmd
rmdir /s /q node_modules
del package-lock.json
rmdir /s /q dist
npm install
npx prisma generate
```

## Notes

- Do not manually create Prisma Client folders.
- Run `npx prisma generate` after changing `schema.prisma`.
- Restart NestJS after changing `.env` or Prisma config.
- Use `npx prisma db seed`, not `npm run db seed`.