# Distributed Job Scheduler

> A distributed job scheduling platform with a React dashboard, Express API, Redis-backed queueing, a dedicated scheduler, and worker processes for execution and observability.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![License](https://img.shields.io/badge/license-ISC-blue)](#license)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Feature Breakdown](#feature-breakdown)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [System Design](#system-design)
- [Database Schema](#database-schema)
- [Job Workflow](#job-workflow)
- [API Overview](#api-overview)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [Deployment Guide](#deployment-guide)
- [Monitoring & Observability](#monitoring--observability)
- [Testing](#testing)
- [Performance & Benchmarks](#performance--benchmarks)
- [Roadmap](#roadmap)
- [Screenshots](#screenshots)
- [License](#license)
- [Author / Contact Information](#author--contact-information)

---

## Overview

This project is a full-stack distributed job scheduler that lets users create, inspect, pause, resume, and delete jobs while a separate scheduler and worker pair handle execution.

The system is designed around service separation, with the dashboard, API, scheduler, and worker running independently while sharing Redis, database, queue, and observability packages.

**Core capabilities:**

- Job creation for `ONCE`, `DELAYED`, and `CRON` execution modes
- Job history, recent execution, and failed-job visibility
- Redis-backed queue depth tracking and worker presence tracking
- Prometheus metrics exposure from all runtime services
- React dashboard for operational management

---

## Architecture

```mermaid
flowchart TB

subgraph Client["Dashboard (React + TypeScript)"]
    Dashboard["Dashboard UI"]
    ApiClient["API Client"]
end

subgraph API["API Service (Express + TypeScript)"]
    ApiApp["Express App"]
    JobRoutes["Job Routes"]
    JobController["Job Controller"]
    JobService["Job Service"]
    Audit["Audit Service"]
    ApiMetrics["/metrics"]
end

subgraph Scheduler["Scheduler Service"]
    SchedulerApp["Scheduler"]
    SchedulerCore["Scheduler Core"]
    SchedulerMetrics["/metrics"]
end

subgraph Worker["Worker Service"]
    WorkerApp["Worker"]
    JobWorker["Job Worker"]
    QueueEvents["Queue Events"]
    WorkerMetrics["/metrics"]
end

subgraph Packages["Shared Packages"]
    Shared["Shared Helpers"]
    Database["Prisma Database Package"]
    Observability["Observability Package"]
end

subgraph Queue["Queue Layer"]
    BullMQ["BullMQ Queue"]
    Redis[("Redis")]
end

subgraph Storage["Database"]
    Postgres[("PostgreSQL")]
end

subgraph Monitoring["Monitoring"]
    Prometheus["Prometheus"]
    Grafana["Grafana"]
end

Dashboard --> ApiClient
ApiClient --> ApiApp

ApiApp --> JobRoutes
JobRoutes --> JobController
JobController --> JobService
JobController --> Audit

JobService --> BullMQ
JobService --> Database

SchedulerApp --> SchedulerCore
SchedulerCore --> BullMQ
SchedulerCore --> Database

WorkerApp --> JobWorker
WorkerApp --> QueueEvents
JobWorker --> BullMQ
JobWorker --> Database

BullMQ --> Redis

Database --> Postgres

ApiApp --> Observability
SchedulerApp --> Observability
WorkerApp --> Observability

Observability --> ApiMetrics
Observability --> SchedulerMetrics
Observability --> WorkerMetrics

ApiMetrics --> Prometheus
SchedulerMetrics --> Prometheus
WorkerMetrics --> Prometheus

Prometheus --> Grafana
```

### Service Topology

| Layer         | Provider             | Notes                                                         |
| ------------- | -------------------- | ------------------------------------------------------------- |
| Frontend      | Vite + React         | Dashboard UI for job management                               |
| API           | Express              | Validates requests, persists jobs, exposes health and metrics |
| Scheduler     | Node.js service      | Maintains scheduling loop and heartbeat in Redis              |
| Worker        | Node.js service      | Consumes jobs and tracks worker heartbeat                     |
| Database      | PostgreSQL + Prisma  | Stores jobs, runs, failures, and audit logs                   |
| Queue / Cache | Redis + BullMQ       | Queueing and service coordination                             |
| Monitoring    | Prometheus + Grafana | Metrics scraping and visualization                            |

---

## Feature Breakdown

### Job Management

- Create jobs with immediate, delayed, or cron-based execution
- View all jobs and individual job details
- Pause, resume, and delete jobs
- Inspect job run history, recent executions, and recent failures

### Runtime Coordination

- Scheduler heartbeat written to Redis every 5 seconds
- Worker heartbeat written to Redis every 5 seconds
- Worker registration tracked through a Redis `workers` set
- Queue depth reported by the API for dashboard visibility

### Observability

- Prometheus metrics endpoint on each runtime service
- Queue depth gauge
- Job creation, completion, failure, and throughput counters
- Histogram support for job duration tracking

---

## Technology Stack

**Backend**

| Category      | Technology             |
| ------------- | ---------------------- |
| Runtime       | Node.js                |
| Framework     | Express                |
| Language      | TypeScript             |
| Database      | PostgreSQL             |
| ORM           | Prisma                 |
| Queue / Cache | Redis, BullMQ, ioredis |
| Validation    | Zod                    |
| Metrics       | prom-client            |
| Logging       | Pino                   |

**Frontend**

| Category      | Technology            |
| ------------- | --------------------- |
| Framework     | React + TypeScript    |
| Build Tool    | Vite                  |
| Data Fetching | Axios, TanStack Query |
| Routing       | React Router          |
| Styling       | Tailwind CSS          |
| Icons         | Lucide React          |
| UX            | React Hot Toast       |

---

## Folder Structure

```text
distributed-job-scheduler/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── app.ts
│   │   │   ├── controllers/
│   │   │   ├── middlewares/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── validators/
│   │   └── package.json
│   ├── dashboard/
│   │   ├── src/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── layouts/
│   │   │   ├── pages/
│   │   │   └── utils/
│   │   └── package.json
│   ├── scheduler/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── scheduler.ts
│   │   │   ├── cleanup.ts
│   │   │   └── services/
│   │   └── package.json
│   └── worker/
│       ├── src/
│       │   ├── index.ts
│       │   └── workers/
│       └── package.json
├── benchmarks/
├── docker/
├── packages/
│   ├── database/
│   ├── observability/
│   └── shared/
├── docker-compose.yml
├── package.json
└── README.md
```

---

## System Design

The codebase follows a layered service architecture:

| Layer         | Files                        | Responsibility                                    |
| ------------- | ---------------------------- | ------------------------------------------------- |
| Routes        | `apps/api/src/routes/*`      | Endpoint definitions and request wiring           |
| Controllers   | `apps/api/src/controllers/*` | Request handling and response shaping             |
| Services      | `apps/api/src/services/*`    | Job logic, audit logging, and query orchestration |
| Validation    | `apps/api/src/validators/*`  | Input validation with Zod                         |
| Shared Infra  | `packages/shared/*`          | Redis connection and queue helpers                |
| Database      | `packages/database/*`        | Prisma client and schema access                   |
| Observability | `packages/observability/*`   | Metrics registry and logger setup                 |
| Scheduler     | `apps/scheduler/src/*`       | Scheduling loop and cleanup coordination          |
| Worker        | `apps/worker/src/*`          | Job execution and queue event processing          |

This separation keeps request handling, persistence, queue coordination, and observability independently maintainable.

---

## Database Schema

```mermaid
erDiagram
  USER {
    String id
    String email
    String name
    DateTime createdAt
    DateTime updatedAt
  }

  JOB {
    String id
    String name
    String description
    Json payload
    String type
    String cronExpression
    Boolean active
    Int priority
    DateTime nextRunAt
    Int maxRetries
    Int timeoutMs
    String status
    DateTime createdAt
    DateTime updatedAt
  }

  JOB_RUN {
    String id
    String jobId
    String status
    DateTime startedAt
    DateTime finishedAt
    String error
    Int duration
    String workerId
    Int attempts
  }

  FAILED_JOB {
    String id
    String jobId
    Json payload
    String reason
    Int attempts
    DateTime failedAt
  }

  AUDIT_LOG {
    String id
    String entityType
    String entityId
    String action
    Json metadata
    DateTime createdAt
  }

  JOB ||--o{ JOB_RUN : has
  JOB ||--o{ FAILED_JOB : has
  JOB ||--o{ AUDIT_LOG : logs
```

### Main Models

| Model       | Purpose                                    |
| ----------- | ------------------------------------------ |
| `User`      | Auth-related user record                   |
| `Job`       | Schedulable job definition                 |
| `JobRun`    | Execution history for a job                |
| `FailedJob` | Failed job record with reason and attempts |
| `AuditLog`  | Event audit trail for job actions          |

---

## Job Workflow

```mermaid
sequenceDiagram
  participant User
  participant Dashboard
  participant API
  participant Postgres as PostgreSQL
  participant Redis
  participant Scheduler
  participant Worker

  User->>Dashboard: Create or manage a job
  Dashboard->>API: POST /jobs/create or job action request
  API->>API: Validate input with Zod
  API->>Postgres: Persist job via Prisma
  API->>Redis: Read queue depth / worker state when needed
  Scheduler->>Redis: Refresh scheduler heartbeat
  Scheduler->>Worker: Coordinate scheduling through shared queue state
  Worker->>Postgres: Record job run / failure data
  Worker->>Redis: Refresh worker heartbeat
  API-->>Dashboard: Return updated job state
```

1. The dashboard sends a job request to the API.
2. The API validates the payload and persists the job with Prisma.
3. The scheduler keeps scheduling state alive and updates a Redis heartbeat.
4. The worker processes jobs, records results, and updates its own heartbeat.
5. The API exposes job state, queue depth, and recent execution data back to the dashboard.

---

## API Overview

> Base URL: `http://localhost:5000`

### Health and Metrics

| Method | Endpoint          | Description                                                 |
| ------ | ----------------- | ----------------------------------------------------------- |
| `GET`  | `/health`         | Checks Redis, database, scheduler heartbeat, and API status |
| `GET`  | `/metrics`        | Prometheus-formatted metrics                                |
| `GET`  | `/jobs/dashboard` | Queue depth for the dashboard                               |
| `GET`  | `/api/worker`     | Registered worker IDs from Redis                            |

### Job Management

| Method   | Endpoint                 | Description                     |
| -------- | ------------------------ | ------------------------------- |
| `POST`   | `/jobs/create`           | Create a job                    |
| `GET`    | `/jobs/get`              | List jobs                       |
| `GET`    | `/jobs/failed`           | List failed jobs                |
| `GET`    | `/jobs/:id`              | Get a single job                |
| `DELETE` | `/jobs/:id/delete`       | Delete a job                    |
| `PATCH`  | `/jobs/:id/pause`        | Pause a job                     |
| `PATCH`  | `/jobs/:id/resume`       | Resume a job                    |
| `GET`    | `/jobs/:id/history`      | Get execution history for a job |
| `GET`    | `/jobs/job-runs/recent`  | Recent executions               |
| `GET`    | `/jobs/job-fails/recent` | Recent failed jobs              |

### Job Payload Shape

The create endpoint accepts the following fields:

```json
{
  "name": "Daily Report",
  "description": "Generate and send a report",
  "payload": { "reportId": "rpt_123" },
  "type": "ONCE",
  "cronExpression": "0 9 * * *",
  "active": true,
  "priority": 1,
  "nextRunAt": "2026-07-28T09:00:00.000Z",
  "maxRetries": 3,
  "timeoutMs": 30000
}
```

Accepted job types:

- `ONCE`
- `DELAYED`
- `CRON`

<!-- TODO: add retry or replay routes here if you expose them later. -->

---

## Installation

### Prerequisites

- Node.js 18+
- npm
- PostgreSQL
- Redis

### Install Dependencies

From the repository root:

```bash
npm install
```

---

## Environment Variables

Create a root `.env` file:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/distributed_job_scheduler
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:5173
VITE_API_BASE_URL=http://localhost:5000
LOG_LEVEL=info

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=distributed_job_scheduler
```

### Notes

- `DATABASE_URL` is used by Prisma and the API layer.
- `REDIS_URL` is used by the shared Redis connection and the runtime services.
- `CORS_ORIGIN` controls which frontend origin the API accepts.
- `VITE_API_BASE_URL` is used by the dashboard Axios client.
- `LOG_LEVEL` is used by the logger configuration.
- `POSTGRES_*` values are used by `docker-compose.yml`.

---

## Local Development Setup

```bash
# Terminal 1 — API
npm run dev --workspace=@scheduler/api

# Terminal 2 — Scheduler
npm run dev --workspace=scheduler

# Terminal 3 — Worker
npm run dev --workspace=worker

# Terminal 4 — Dashboard
npm run dev --workspace=dashboard
```

### Optional Full Stack Start

```bash
npm run dev
```

That runs the dev script across all workspaces.

### Production-Style Start

```bash
npm run build
npm start
```

### Docker Compose

```bash
docker compose up --build
```

---

## Deployment Guide

<!-- TODO: add your actual deployment links if you have them. -->

### Suggested Deployment Topology

| Layer         | Provider                       | Notes                            |
| ------------- | ------------------------------ | -------------------------------- |
| Frontend      | Vercel / Netlify               | Static dashboard build           |
| API           | Render / Railway / Docker host | Express API and health endpoints |
| Scheduler     | Render / Railway / Docker host | Long-running scheduler process   |
| Worker        | Render / Railway / Docker host | Long-running worker process      |
| Database      | PostgreSQL managed service     | Prisma-backed persistence        |
| Queue / Cache | Redis managed service          | Shared queue and heartbeat store |

---

## Monitoring & Observability

### Metrics

The project exposes Prometheus-compatible metrics from the API, scheduler, and worker services.

Tracked signals include:

- Total jobs created
- Total jobs completed
- Total jobs failed
- Queue depth
- Worker throughput
- Job execution duration

### Health Signals

- API health route checks Redis, database, and scheduler heartbeat state.
- Scheduler writes a `scheduler:heartbeat` key to Redis.
- Worker writes per-worker heartbeat keys to Redis.
- The dashboard can surface queue depth through the API.

### Logging

- API and runtime services use structured logging.
- `LOG_LEVEL` controls logger verbosity where supported.

---

## Testing

<!-- TODO: add real test commands if you have them wired in. -->

Suggested validation flows:

- Create a job and verify it appears in `/jobs/get`
- Pause and resume a job and confirm state changes
- Check `/health` with Redis or PostgreSQL temporarily offline
- Verify `/metrics` exports Prometheus text format

---

## Performance & Benchmarks

- A benchmark script exists at [benchmarks/create-10000-jobs.ts](benchmarks/create-10000-jobs.ts).
- It uses `autocannon` to stress `POST /jobs/create`.
- No benchmark results are committed yet.

<!-- TODO: add your own benchmark numbers here, for example throughput, latency, and queue drain time. -->

---

## Roadmap

- Add a committed `.env.example` for faster onboarding
- Add end-to-end tests for job creation and lifecycle actions
- Add dashboard screenshots and a short demo GIF
- Reconcile any future dashboard calls with API routes as features expand
- Add a deployment section with real live URLs once available

---

## Screenshots

<!-- TODO: add screenshots or GIFs of the dashboard, job flow, and metrics views. -->

# Dashboard
### Overview
![Dashboard Overview](assets/dashboard-overview.png)
### Recent-Executed-history
![Dashboard Recent-Execution-History](assets/dashboard-execution-history.png)
### Recent-failed-Jobs-section
![Dashboard Recent-failed-jobs](assets/dasbhoard-failedjobs.png)

---

## License

This project is currently listed as `ISC` in the workspace package manifests.

<!-- TODO: add a LICENSE file if you want to formalize or change the license. -->

---

## Author / Contact Information

<!-- TODO: add your GitHub, LinkedIn, portfolio, or email here. -->

### Connect with Me

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Steel-roger-moondradev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dev-moondra-56910a1b9/)
