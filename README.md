# Scientechnic NestJS Backend

Modular NestJS backend for the Scientechnic dashboard.

## Included
- Auth login/register with JWT
- Prisma 6.x schema and seed
- Swagger docs
- Dashboard endpoints
- Projects, Tenders, Planning, QA/QC, Procurement, Maintenance modules

## Run
```bash
copy .env.example .env
npm install
set NODE_TLS_REJECT_UNAUTHORIZED=0
npm run prisma:generate
npm run migrate:init
npm run db:seed
npm run start:dev

```

Swagger: http://localhost:3001/api/docs

Seed login:
```text
admin@scientechnic.local
Admin@123
```
