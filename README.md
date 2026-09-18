[README (4).md](https://github.com/user-attachments/files/32371034/README.4.md)
<div align="center">

# ⏱️ Distributed Job Scheduler

**A production-inspired job scheduling platform built around a decoupled API, scheduler, Redis/BullMQ queue, and horizontally scalable workers.**

Supports one-time, delayed, and cron jobs — with persistent execution history, retries, failure tracking, safe concurrent job claiming, idempotent execution, and full observability.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-Queue-DC382D)](https://bullmq.io/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Prometheus](https://img.shields.io/badge/Prometheus-Monitoring-E6522C?logo=prometheus&logoColor=white)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Grafana-Dashboards-F46800?logo=grafana&logoColor=white)](https://grafana.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](#license)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Why This Architecture](#-why-this-architecture)
- [Scheduler: Poll → Claim → Drain](#-scheduler-poll--claim--drain)
- [Concurrency Safety: `SKIP LOCKED`](#-concurrency-safety-skip-locked)
- [Worker Layer](#-worker-layer)
- [Idempotency & Duplicate Execution](#-idempotency--duplicate-execution)
- [Data Model](#-data-model)
- [Job Lifecycle](#-job-lifecycle)
- [Failure Handling & Retries](#-failure-handling--retries)
- [End-to-End Workflow](#-end-to-end-workflow)
- [API Reference](#-api-reference)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Observability](#-observability)
- [Testing](#-testing)
- [Performance](#-performance)
- [Trade-offs at a Glance](#-trade-offs-at-a-glance)
- [Roadmap](#-roadmap)
- [Screenshots](#-screenshots)
- [License & Author](#-license--author)

---

## 🧭 Overview

This project separates **job creation**, **scheduling**, **queuing**, and **execution** into independent services instead of one monolithic process handling everything.

| Stage | Responsibility |
|---|---|
| **API** | Accepts commands (create/pause/resume/delete/inspect) |
| **PostgreSQL** | Durable source of truth for job state & history |
| **Scheduler** | Finds due jobs and safely claims them |
| **Redis / BullMQ** | Buffers and hands off work asynchronously |
| **Workers** | Execute the actual background work (HTTP calls, email) |

**Core capabilities:**

`ONCE` · `DELAYED` · `CRON` jobs &nbsp;•&nbsp; pause/resume lifecycle &nbsp;•&nbsp; persistent execution history &nbsp;•&nbsp; retries & failure tracking &nbsp;•&nbsp; scheduler/worker heartbeats &nbsp;•&nbsp; multi-instance scheduler coordination &nbsp;•&nbsp; horizontal worker scaling &nbsp;•&nbsp; idempotency-aware execution &nbsp;•&nbsp; Prometheus + Grafana &nbsp;•&nbsp; structured logging &nbsp;•&nbsp; Dockerized infra &nbsp;•&nbsp; load-tested with `autocannon`

---

## 🏗 Architecture

```mermaid
flowchart TB
    Client(["🖥️ React Dashboard / Client"]):::client

    subgraph API["⚙️ API Service"]
        direction LR
        Routes["Routes"] --> Controllers["Controllers"] --> Services["Job Services"]
        Services --> Validation["Zod Validation"]
    end

    subgraph DB["🗄️ PostgreSQL — Source of Truth"]
        direction LR
        Jobs[("Job")]
        Runs[("JobRun")]
        Failed[("FailedJob")]
        Audit[("AuditLog")]
    end

    subgraph SCHED["🧠 Scheduler Service"]
        direction LR
        Poll["Poll"] --> Claim["Claim\n(SKIP LOCKED)"] --> Drain["Drain Batch"]
    end

    subgraph QUEUE["📬 Queue Layer"]
        direction LR
        Bull["BullMQ"] --> Redis[("Redis")]
    end

    subgraph WORKERS["👷 Worker Fleet"]
        direction LR
        W1["Worker 1"]
        W2["Worker 2"]
        WN["Worker N"]
    end

    subgraph EXEC["🔌 Background Execution"]
        direction LR
        HTTP["HTTP / API Call"]
        EMAIL["Email Send"]
    end

    subgraph OBS["📊 Observability"]
        direction LR
        Prom["Prometheus"] --> Grafana["Grafana"]
        Logs["Structured Logs"]
    end

    Client --> Routes
    Validation --> Jobs
    Jobs --> Poll
    Drain --> Bull
    Redis --> W1 & W2 & WN
    W1 & W2 & WN --> HTTP & EMAIL
    W1 & W2 & WN --> Runs
    Runs --> Failed
    Jobs --> Runs & Audit

    API -.metrics.-> Prom
    SCHED -.metrics.-> Prom
    WORKERS -.metrics.-> Prom
    API -.logs.-> Logs
    SCHED -.logs.-> Logs
    WORKERS -.logs.-> Logs

    classDef client fill:#61DAFB,stroke:#20232a,color:#000
    classDef default fill:#f8f9fa,stroke:#888,color:#111
    style DB fill:#e8f0fe,stroke:#336791
    style QUEUE fill:#fdeaea,stroke:#DC382D
    style OBS fill:#fdf0e6,stroke:#E6522C
    style SCHED fill:#eef7ee,stroke:#2e7d32
    style API fill:#eaf1fb,stroke:#3178C6
    style WORKERS fill:#f3eefb,stroke:#7b3fb0
```

<div align="center">

| Component | Responsibility | Why it exists |
|---|---|---|
| **React Dashboard** | Operational UI | Lets operators inspect & control jobs |
| **API** | Synchronous request handling | Keeps user-facing traffic independent of background work |
| **PostgreSQL** | Durable source of truth | Stores job definitions & execution history |
| **Scheduler** | Finds & claims due work | Separates *scheduling* from *execution* |
| **Redis** | Queue & coordination state | Fast transient coordination + queue storage |
| **BullMQ** | Reliable queue abstraction | Handles attempts, delays, and worker consumption |
| **Worker** | Executes background work | Scales independently of API/scheduler |
| **Prometheus / Grafana** | Metrics & visualization | Makes runtime behavior measurable and observable |

</div>

---

## 🤔 Why This Architecture

A **database-backed scheduler + Redis queue + stateless workers** design was chosen because scheduling and execution have fundamentally different responsibilities and scaling profiles.

<details>
<summary><strong>API — commands only, never long-running work</strong></summary>

<br>

The API accepts create/pause/resume/delete/inspect commands but never executes background work directly. If it did, a slow email call or timed-out HTTP request could consume request-server resources and degrade user-facing traffic.
</details>

<details>
<summary><strong>Scheduler — decides *when*, not *how*</strong></summary>

<br>

The scheduler only answers "which jobs are due right now?" — it finds due jobs, safely claims them, writes execution records, and hands work to BullMQ. It never performs the actual business logic.
</details>

<details>
<summary><strong>Queue — a shock absorber between scheduling and execution</strong></summary>

<br>

Redis/BullMQ decouples the scheduler from the workers, providing asynchronous processing, backpressure, retry infrastructure, and buffering when workers are temporarily slower than the scheduler.
</details>

<details>
<summary><strong>Worker — generic execution boundary</strong></summary>

<br>

Workers are deliberately generic enough to run different categories of background work (HTTP/API calls, email delivery), keeping the scheduler focused purely on timing rather than implementation details.
</details>

<details>
<summary><strong>Full list of architecture decisions & trade-offs</strong></summary>

<br>

| Decision | Reasoning | Trade-off |
|---|---|---|
| **PostgreSQL as source of truth** | Job definitions & history are durable business state — they must survive a Redis restart | Adds DB reads/writes to the scheduling path |
| **Separate scheduler & worker** | Independent scaling boundaries — scheduling throughput and execution throughput don't need to scale together | More processes to operate and monitor |
| **Redis/BullMQ over direct calls** | Async execution, buffering, retries, and worker scaling; scheduler is never blocked by job duration | Additional infrastructure to run |
| **Database locking over app-level coordination** | Multiple scheduler instances can wake up simultaneously — the DB, not app memory, arbitrates ownership | More complex transaction logic |
| **Polling over DB-triggered scheduling** | Simple, explicit, operationally predictable | Small scheduling delay; periodic DB reads |
| **Drain batches, not one job per tick** | Efficiently handles bursts where many jobs become due at once | Larger bursts of queue writes |

</details>

---

## 🔁 Scheduler: Poll → Claim → Drain

The scheduler is built from two complementary loops:

- **Poll** — *"Should I check the database for newly due jobs?"*
- **Drain** — *"Now that I found due work, how much should I process before sleeping again?"*

Separating these avoids increasing polling frequency just because a large batch of jobs became due at once.

```mermaid
flowchart TD
    A([Scheduler tick]) --> B[Refresh heartbeat]
    B --> C[Poll PostgreSQL for due jobs]
    C --> D{Due jobs found?}
    D -- No --> H([Sleep until next tick])
    D -- Yes --> E["Atomically claim a batch\n(FOR UPDATE SKIP LOCKED)"]
    E --> F[Create JobRun records]
    F --> G[Enqueue into BullMQ]
    G --> D

    classDef action fill:#eef7ee,stroke:#2e7d32,color:#111
    classDef decision fill:#fff8e1,stroke:#f9a825,color:#111
    classDef term fill:#e3f2fd,stroke:#1565c0,color:#111
    class B,C,E,F,G action
    class D decision
    class A,H term
```

---

## 🔒 Concurrency Safety: `SKIP LOCKED`

The most important distributed-systems decision in this project: **how does the scheduler safely claim jobs when multiple scheduler instances run concurrently?**

Without coordination, two schedulers waking at the same moment could both read and enqueue the same due job — creating duplicate work:

```mermaid
flowchart LR
    JobX["Job X (due)"] --> SA["Scheduler A"]
    JobX --> SB["Scheduler B"]
    SA --> Q1["BullMQ enqueue"]
    SB --> Q2["BullMQ enqueue ❌ duplicate"]
    style Q2 fill:#fdeaea,stroke:#c62828,color:#900
```

**The fix:** claiming due jobs inside a transaction using PostgreSQL's `FOR UPDATE SKIP LOCKED`:

```sql
SELECT * FROM "Job"
WHERE status = 'ACTIVE' AND "nextRunAt" <= now()
ORDER BY "nextRunAt"
FOR UPDATE SKIP LOCKED
LIMIT 50;
```

| Clause | Effect |
|---|---|
| `FOR UPDATE` | Locks selected rows for the current transaction — no other scheduler can claim them simultaneously |
| `SKIP LOCKED` | If a row is already locked by another scheduler, skip it instead of blocking |

```mermaid
flowchart LR
    subgraph Result["With row-level locking"]
        direction LR
        A1["Scheduler A"] -->|locks & claims| J1["Job X"] --> Q1b["BullMQ → Worker"]
        A2["Scheduler B"] -->|Job X locked → SKIP| J2["Job Y, Z, ..."] --> Q2b["BullMQ → Worker"]
    end
    style Result fill:#eef7ee,stroke:#2e7d32
```

This lets N schedulers divide up available work without serializing on the same rows — e.g. with 100 due jobs, Scheduler A might claim 1–50 while Scheduler B claims 51–100 (exact split depends on query ordering/timing).

> ⚠️ **Important:** row locking only protects the *claiming phase*. It does **not** guarantee an external side effect (like sending an email) happens exactly once — worker crashes, network failures, and queue redelivery can still cause repeat attempts. That's a separate concern, handled by idempotency (below).

---

## 👷 Worker Layer

Workers are stateless consumers of `{ jobId, jobRunId }` messages from BullMQ.

| ID | Identifies | Example |
|---|---|---|
| `jobId` | The logical job definition | `daily-report` |
| `jobRunId` | One specific execution attempt | `run-2026-09-18-001` |

A single recurring `Job` fans out into many `JobRun` records — essential for history, retries, debugging, and metrics.

```mermaid
flowchart LR
    BullMQ(["BullMQ"]) --> Worker["Worker"]
    Worker --> HTTP["HTTP / API request"] --> Ext1["External / internal service"]
    Worker --> Email["Email send"] --> Ext2["Email provider / SMTP"]
    Worker --> PG[("PostgreSQL — JobRun")]

    style BullMQ fill:#fdeaea,stroke:#DC382D
    style PG fill:#e8f0fe,stroke:#336791
```

Both HTTP calls and email delivery share the same worker boundary because they're both **background side effects** with the same failure modes: network latency, timeouts, transient errors, retries, and rate limits.

<details>
<summary><strong>Future evolution: dedicated queues per workload class</strong></summary>

<br>

A generic worker is easy to extend early on, but as job-type variety grows, a single worker process can become too broad. A natural next step is workload isolation via dedicated queues:

```mermaid
flowchart TB
    Bull["BullMQ"] --> HQ["HTTP Queue"] --> HW["HTTP Workers"]
    Bull --> EQ["Email Queue"] --> EW["Email Workers"]
    Bull --> CQ["CPU Queue"] --> CW["CPU Workers"]
```

This costs more queues and operational complexity in exchange for stronger workload isolation.
</details>

---

## ♻️ Idempotency & Duplicate Execution

Distributed systems must distinguish between three *different* problems:

1. **Duplicate job claiming** → solved by database locking (`SKIP LOCKED`)
2. **Duplicate execution attempts** → mitigated by retries + execution state
3. **Duplicate external side effects** → requires idempotency

An operation is idempotent when running it multiple times produces the same result as running it once: `f(f(x)) = f(x)`. This matters because a worker can fail at an *ambiguous point* — e.g. after an email provider confirms send, but before the worker marks the `JobRun` complete.

**Strategy:** `jobRunId` acts as a stable identity for one execution attempt and can double as an idempotency key for external systems that support one:

```
Idempotency-Key: <jobRunId>
```

> ⚠️ **This pattern is unsafe on its own:**
> ```js
> if (!completed) {
>   externalRequest();
>   markCompleted();
> }
> ```
> Two workers can observe `completed = false` before either updates it. Idempotency requires **atomic state transitions and/or an idempotent external operation** — not just a pre-check. This project layers four complementary protections: database locking, execution state, stable `JobRun` identity, and idempotent external operations where supported.

---

## 🗃 Data Model

The schema is intentionally centered on **jobs and executions**, not users — there is currently no `User` table; this is a scheduling-domain database.

```mermaid
erDiagram
    JOB ||--o{ JOB_RUN : has
    JOB ||--o{ FAILED_JOB : has
    JOB ||--o{ AUDIT_LOG : generates

    JOB {
        string id
        string name
        string description
        json payload
        enum type
        string cronExpression
        enum status
        int priority
        datetime nextRunAt
        int maxRetries
        int timeoutMs
    }
    JOB_RUN {
        string id
        string jobId
        string status
        datetime startedAt
        datetime finishedAt
        string error
        int duration
        string workerId
        int attempts
    }
    FAILED_JOB {
        string id
        string jobId
        json payload
        string reason
        int attempts
        datetime failedAt
    }
    AUDIT_LOG {
        string id
        string entityType
        string entityId
        string action
        json metadata
        datetime createdAt
    }
```

| Table | Purpose |
|---|---|
| **`Job`** | The logical scheduled task — *what should happen*. One `Job` can produce many runs. |
| **`JobRun`** | One execution attempt — *one time it happened*. Keeps history without overwriting the job. |
| **`FailedJob`** | Failure details stored separately so failures stay inspectable independent of current job state. |
| **`AuditLog`** | Records state-changing actions: `JOB_CREATED`, `JOB_PAUSED`, `JOB_RESUMED`, `JOB_DELETED`. |

**Indexing:** due-job discovery (`status = ACTIVE AND nextRunAt <= now()`) is the scheduler's hottest query, so `Job` carries a composite index on `(status, nextRunAt)`.

---

## 🔄 Job Lifecycle

Status is modeled as an explicit enum rather than a boolean — a boolean can't distinguish `ACTIVE` / `PAUSED` / `COMPLETED` / `FAILED`, and an enum makes invalid transitions easier to reason about.

```mermaid
stateDiagram-v2
    [*] --> ACTIVE
    ACTIVE --> PAUSED : pause (CRON/DELAYED only)
    PAUSED --> ACTIVE : resume
    ACTIVE --> COMPLETED : ONCE job finishes
    ACTIVE --> FAILED : retries exhausted
    COMPLETED --> [*]
    FAILED --> [*]
```

- `ONCE` jobs cannot be paused.
- Active `CRON` and `DELAYED` jobs can be paused/resumed.
- Completed jobs are never resumed as schedulable.
- The scheduler checks job status *before* claiming due work.

---

## 🧯 Failure Handling & Retries

Background work fails for mundane, expected reasons: HTTP timeouts, external API errors, email provider outages, network blips, worker crashes, DB connectivity issues.

```mermaid
flowchart TD
    A[JobRun created] --> B[Worker starts]
    B --> C[Execute work]
    C -->|success| D([COMPLETED])
    C -->|failure| E{Retries remaining?}
    E -->|yes| F[Retry] --> B
    E -->|no| G([FAILED]) --> H[(FailedJob)]

    classDef ok fill:#e8f5e9,stroke:#2e7d32
    classDef bad fill:#fdeaea,stroke:#c62828
    class D ok
    class G,H bad
```

Retries exist to recover from *transient* failures automatically. They are **not** a substitute for idempotency — repeating a non-idempotent side effect can be actively harmful.

---

## 🔗 End-to-End Workflow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant PostgreSQL
    participant Scheduler
    participant BullMQ
    participant Worker
    participant External as External Service

    Client->>API: Create Job
    API->>PostgreSQL: Insert Job
    API-->>Client: Job Created

    loop Poll
        Scheduler->>PostgreSQL: Find due ACTIVE jobs
        PostgreSQL-->>Scheduler: Due rows
        Scheduler->>PostgreSQL: Lock + claim (SKIP LOCKED)
        PostgreSQL-->>Scheduler: Claimed jobs
        Scheduler->>PostgreSQL: Create JobRun
        Scheduler->>BullMQ: Enqueue {jobId, jobRunId}
    end

    BullMQ-->>Worker: Deliver job
    Worker->>PostgreSQL: Mark JobRun running
    Worker->>External: HTTP request / Email
    External-->>Worker: Success / Failure

    alt Success
        Worker->>PostgreSQL: Mark JobRun completed
    else Failure
        Worker->>PostgreSQL: Record failure / retry state
    end
```

---

## 📡 API Reference

**Base URL:** `http://localhost:5000`

<table>
<tr><th colspan="3">Health & Metrics</th></tr>
<tr><td><code>GET</code></td><td><code>/health</code></td><td>API, Redis, DB, and scheduler heartbeat check</td></tr>
<tr><td><code>GET</code></td><td><code>/metrics</code></td><td>Prometheus metrics</td></tr>
<tr><td><code>GET</code></td><td><code>/jobs/dashboard</code></td><td>Dashboard queue information</td></tr>
<tr><td><code>GET</code></td><td><code>/api/worker</code></td><td>Registered workers</td></tr>
<tr><th colspan="3">Job Management</th></tr>
<tr><td><code>POST</code></td><td><code>/jobs/create</code></td><td>Create a job</td></tr>
<tr><td><code>GET</code></td><td><code>/jobs/get</code></td><td>List jobs</td></tr>
<tr><td><code>GET</code></td><td><code>/jobs/failed</code></td><td>List failed jobs</td></tr>
<tr><td><code>GET</code></td><td><code>/jobs/:id</code></td><td>Get a job</td></tr>
<tr><td><code>DELETE</code></td><td><code>/jobs/:id/delete</code></td><td>Delete a job</td></tr>
<tr><td><code>PATCH</code></td><td><code>/jobs/:id/pause</code></td><td>Pause a job</td></tr>
<tr><td><code>PATCH</code></td><td><code>/jobs/:id/resume</code></td><td>Resume a job</td></tr>
<tr><td><code>GET</code></td><td><code>/jobs/:id/history</code></td><td>Execution history</td></tr>
<tr><td><code>GET</code></td><td><code>/jobs/job-runs/recent</code></td><td>Recent executions</td></tr>
<tr><td><code>GET</code></td><td><code>/jobs/job-fails/recent</code></td><td>Recent failures</td></tr>
</table>

**Job types:** `ONCE` (runs once) · `DELAYED` (runs at a future timestamp) · `CRON` (repeats per expression, e.g. `0 9 * * *` = daily at 09:00)

---

## 🧰 Tech Stack

<table>
<tr valign="top">
<td>

**Backend**
| | |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Queue | BullMQ |
| Coordination | Redis (ioredis) |
| Validation | Zod |
| Metrics | prom-client |
| Logging | Pino |

</td>
<td>

**Frontend**
| | |
|---|---|
| Framework | React + TypeScript |
| Build Tool | Vite |
| Data Fetching | Axios + TanStack Query |
| Routing | React Router |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Notifications | React Hot Toast |

</td>
<td>

**Infrastructure**
| | |
|---|---|
| Containers | Docker |
| Orchestration | Docker Compose |
| Metrics | Prometheus |
| Dashboards | Grafana |
| Load Testing | autocannon |
| Testing | Jest + Supertest |

</td>
</tr>
</table>

---

## 📁 Project Structure

```text
distributed-job-scheduler/
├── apps/
│   ├── api/            # Express API — routes, controllers, services, validators
│   ├── dashboard/       # React operational UI
│   ├── scheduler/       # Poll → claim → drain service
│   └── worker/          # Queue consumers — HTTP & email execution
├── packages/
│   ├── database/        # Prisma client & schema
│   ├── observability/   # Metrics & logging helpers
│   └── shared/          # Redis / queue helpers
├── benchmarks/           # autocannon load-test scripts
├── docker/
├── docker-compose.yml
└── package.json
```

Each service (`api`, `scheduler`, `worker`, `dashboard`) is independently deployable and scalable — the architectural boundary `API ≠ Scheduler ≠ Worker` is enforced at the process level, not just conceptually.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL & Redis (or Docker / Docker Compose — recommended)

### Install

```bash
npm install
```

### Environment Variables

Create a root `.env`:

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

### Run with Docker Compose

```bash
docker compose up --build
```

### Run services individually

```bash
npm run dev --workspace=@scheduler/api    # API
npm run dev --workspace=scheduler         # Scheduler
npm run dev --workspace=worker            # Worker
npm run dev --workspace=dashboard         # Dashboard
```

---

## 🌐 Deployment

The codebase is built so that API, scheduler, and worker are **independent, horizontally scalable services** — but the current deployment intentionally runs them consolidated to keep hosting costs down. Scaling out later is a config/infra change, not a code change.

### Current deployment (cost-optimized)

Frontend on **Vercel**; API, scheduler, and worker run as separate processes **inside a single Render instance** to minimize the number of paid services while still keeping the code's service boundaries intact.

```mermaid
flowchart TB
    User(["🌍 User"]) --> FE["Vercel — React Dashboard"]
    FE --> RI

    subgraph RI["🖥️ Single Render Instance"]
        direction TB
        API["API process"]
        SCH["Scheduler process"]
        WRK["Worker process"]
    end

    RI --> PG[("Managed PostgreSQL")]
    RI --> RD[("Managed Redis")]

    style FE fill:#eaf1fb,stroke:#0070f3,color:#111
    style RI fill:#fff8e1,stroke:#f9a825,color:#111
    style PG fill:#e8f0fe,stroke:#336791
    style RD fill:#fdeaea,stroke:#DC382D
```

> ⚠️ **Trade-off:** all three processes share the same CPU/memory footprint, so a burst in worker load (e.g. a slow email provider) can compete with the API for resources. This is acceptable at current scale because the processes are lightweight and traffic is low — but it's the first thing to split when load grows.

### Target deployment (when resources allow)

No code changes required — each service already reads its own config and connects independently to PostgreSQL/Redis. Scaling out is purely an infrastructure decision: deploy each `apps/*` workspace as its own service and increase instance counts.

```mermaid
flowchart TB
    User(["🌍 User"]) --> FE["Vercel — React Dashboard"]
    FE --> API1["API instance 1"] & API2["API instance 2"] & API3["API instance N"]

    API1 & API2 & API3 --> PG[("Managed PostgreSQL")]
    API1 & API2 & API3 --> RD[("Managed Redis")]

    SCH1["Scheduler 1"] --> PG
    SCH2["Scheduler 2"] --> PG
    SCH1 & SCH2 --> RD

    RD --> W1["Worker 1"] & W2["Worker 2"] & W3["Worker N"]

    style FE fill:#eaf1fb,stroke:#0070f3,color:#111
    style PG fill:#e8f0fe,stroke:#336791
    style RD fill:#fdeaea,stroke:#DC382D
```

| | Current | Target |
|---|---|---|
| API | 1 process, shared instance | N independent instances behind a load balancer |
| Scheduler | 1 process, shared instance | Multiple instances, coordinated via `SKIP LOCKED` |
| Worker | 1 process, shared instance | N independent instances scaled to queue depth |
| Cost | Minimal — 1 compute instance + managed DB/Redis | Higher — separate compute per service |
| Fault isolation | None — one crash can affect all three | Full — each service fails independently |

Because the scheduler's concurrency safety (`FOR UPDATE SKIP LOCKED`, see [above](#-concurrency-safety-skip-locked)) and the worker's stateless queue-consumption model were designed for multi-instance operation from day one, moving from the current setup to the target setup is just a matter of provisioning more services — not rearchitecting.

---

## 📊 Observability

Observability is treated as part of the system, not an afterthought — a successful request alone doesn't tell you whether a *distributed* system is healthy.

**Tracked metrics:** `jobs_created_total` · `jobs_completed_total` · `jobs_failed_total` · `queue_depth` · worker throughput · job execution duration · scheduler/worker heartbeat state

**Operational questions this answers:** Are jobs accumulating? Are workers alive? Are jobs slowing down? Are failures increasing? Is the queue draining?

Scheduler and workers write periodic heartbeats into Redis (`scheduler:heartbeat`, `worker:<id>:heartbeat`) and register in a `workers` set, letting the API/dashboard expose live worker presence. Heartbeats are short-lived coordination signals — not durable business state.

---

## 🧪 Testing

<table>
<tr><th>Area</th><th>Scenarios</th></tr>
<tr><td><strong>Job lifecycle</strong></td><td>Create ONCE/DELAYED/CRON jobs · pause/resume · verify completed jobs can't be resumed · delete</td></tr>
<tr><td><strong>Scheduler</strong></td><td>Due-job discovery · batch draining · multiple scheduler processes · <code>SKIP LOCKED</code> prevents duplicate claiming</td></tr>
<tr><td><strong>Worker</strong></td><td>Successful execution · forced failure & retry · failed-job persistence · heartbeat · multi-worker consumption</td></tr>
<tr><td><strong>Infrastructure</strong></td><td>Redis/PostgreSQL outage handling · <code>/health</code> · <code>/metrics</code> · Grafana visibility</td></tr>
</table>

---

## ⚡ Performance

Load-tested `POST /jobs/create` with **10,000+ requests, 100 concurrent connections** (local, via `autocannon`):

| Metric | Result |
|---|---|
| Throughput | ~1,080 req/sec |
| Request failures | 0% |
| P99 latency | < ~170 ms |
| Successful responses (single run) | 10,793 |

> These are local benchmarks, not production capacity claims — actual throughput depends on DB/Redis hardware, network latency, deployment topology, and workload characteristics.

**Independent scaling dimensions:**

```mermaid
flowchart LR
    subgraph API_Scale["API"]
        C["Client"] --> A1["API 1"] & A2["API 2"] & A3["API 3"]
    end
    subgraph Sched_Scale["Scheduler"]
        S1["Scheduler 1"] & S2["Scheduler 2"] --> PGX[("PostgreSQL")] --> BQ["BullMQ"]
    end
    subgraph Worker_Scale["Worker"]
        BQ2["BullMQ"] --> WA["Worker 1"] & WB["Worker 2"] & WC["Worker N"]
    end
```

---

## ⚖️ Trade-offs at a Glance

| Decision | Benefit | Cost |
|---|---|---|
| Separate API / scheduler / worker | Independent scaling & fault isolation | More services to deploy |
| PostgreSQL as source of truth | Durable scheduling & execution state | Extra DB load & transaction complexity |
| Redis + BullMQ | Async buffering & worker scaling | Additional infrastructure |
| Polling | Simple, predictable | Periodic reads, small scheduling delay |
| Drain batches | Higher scheduling efficiency | Larger bursts of queue writes |
| `SKIP LOCKED` | Safe concurrent claiming | More complex transaction logic |
| Explicit job status | Clear lifecycle model | More state-transition rules |
| Job + JobRun separation | Complete execution history | More DB records |
| Generic worker | Easy to add job types | Possible workload coupling |
| Prometheus/Grafana | Operational visibility | Extra monitoring components |
| Idempotency-aware execution | Safer retries & duplicate handling | Careful state + external API design required |

<details>
<summary><strong>Design philosophy (guiding principles)</strong></summary>

<br>

1. **Separate durable state from transient coordination** — PostgreSQL owns business state; Redis owns queue/coordination state.
2. **Separate scheduling from execution** — the scheduler decides *when*; the worker decides *how*.
3. **Assume failures happen** — workers crash, networks fail, APIs time out; execution state and retries are designed in from the start.
4. **Don't rely on a single process** — API, scheduler, and worker capacity evolve independently.
5. **Make concurrency explicit** — concurrent schedulers coordinate via PostgreSQL transactions and row locks, not in-memory flags.
6. **Treat duplicate execution as a real problem** — locking protects claiming, idempotency protects side effects, retries handle transient failures. These are complementary, not interchangeable.

</details>

---

## 🗺 Roadmap

- [ ] CI/CD pipeline
- [ ] Cloud deployment
- [ ] Expanded end-to-end test suite
- [ ] More job types
- [ ] Stronger per-job idempotency guarantees
- [ ] Dedicated queues per workload class
- [ ] Worker autoscaling
- [ ] Improved distributed scheduler coordination
- [ ] Dead-letter / replay workflows
- [ ] Auth/authorization (if multi-user)
- [ ] Production deployment documentation

---

## 🖼 Screenshots

<details open>
<summary><strong>Dashboard</strong></summary>

<br>

| Overview | Execution History | Failed Jobs |
|---|---|---|
| ![Dashboard Overview](assets/dashboard-overview.png) | ![Execution History](assets/dashboard-execution-history.png) | ![Failed Jobs](assets/dasbhoard-failedjobs.png) |

</details>

<details>
<summary><strong>Job Details</strong></summary>

<br>

| Job Page | Metadata | Execution History |
|---|---|---|
| ![Job View Page](assets/jobdetails.png) | ![Job Metadata](assets/jobdetails-metadata.png) | ![Job Execution History](assets/jobdetails-executionhistory.png) |

</details>

---

## 📄 License & Author

Licensed under **ISC** (as declared in the workspace package manifests).

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Steel-roger-moondradev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dev-moondra-56910a1b9/)

</div>
