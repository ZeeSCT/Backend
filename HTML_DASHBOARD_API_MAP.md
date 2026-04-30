# Scientechnic HTML Dashboard API Map

This backend now exposes module-based endpoints aligned with the uploaded HTML dashboard menu.

## Auth
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `GET /api/v1/auth/me`

Use seeded login after `npm run db:seed`:
- Email: `admin@scientechnic.local`
- Password: `Admin@123`

## Screen Catalog
- `GET /api/v1/screens` returns all 6 modules and 41 screen endpoint mappings for the frontend sidebar.

## Executive Screens
- `GET /api/v1/executive/portfolio-overview`
- `GET /api/v1/executive/project-health`
- `GET /api/v1/executive/revenue-billing`
- `GET /api/v1/executive/approval-bottlenecks`
- `GET /api/v1/executive/documentation-status`
- `GET /api/v1/executive/project-drill-down?projectId=<id>`

## Tender Management Screens
- `GET /api/v1/tenders/tender-pipeline`
- `GET /api/v1/tenders/enquiry-register`
- `GET /api/v1/tenders/bid-analysis`
- `GET /api/v1/tenders/costing-pricing`
- `GET /api/v1/tenders/risk-assessment`
- `GET /api/v1/tenders/tender-approvals`
- `GET /api/v1/tenders/submission-tracker`
- `GET /api/v1/tenders/won-lost-register`

## Project Management Screens
- `GET /api/v1/projects/project-workspace?projectId=<id>`
- `GET /api/v1/projects/milestone-tracker`
- `GET /api/v1/projects/work-package-tracker`
- `GET /api/v1/projects/site-progress-view`
- `GET /api/v1/projects/task-assignment-board`
- `GET /api/v1/projects/risk-issue-blocker`
- `GET /api/v1/projects/document-readiness`
- `GET /api/v1/projects/approval-follow-up`
- `GET /api/v1/projects/inspection-follow-up`
- `GET /api/v1/projects/material-resource`
- `GET /api/v1/projects/commercial-progress`
- `GET /api/v1/projects/planning-overview`
- `GET /api/v1/projects/wbs-timeline`
- `GET /api/v1/projects/milestone-register`
- `GET /api/v1/projects/activity-register`
- `GET /api/v1/projects/critical-float-view`
- `GET /api/v1/projects/resource-plan`
- `GET /api/v1/projects/monthly-lookahead`

## QA/QC Screens
- `GET /api/v1/qaqc/inspection-register`
- `GET /api/v1/qaqc/ncr-log`
- `GET /api/v1/qaqc/punch-list`

## Procurement Screens
- `GET /api/v1/procurement/material-requests`
- `GET /api/v1/procurement/rfq-tracker`
- `GET /api/v1/procurement/po-register`

## Maintenance Screens
- `GET /api/v1/maintenance/maintenance-dashboard`
- `GET /api/v1/maintenance/preventive-tasks`
- `GET /api/v1/maintenance/corrective-tasks`

## Run
```bash
npm install
npm run prisma:generate
npm run migrate:init
npm run db:seed
npm run start:dev
```

Swagger:
- `http://localhost:3001/api/docs`
