# ⚖️ Online Judge — MERN + Ephemeral Docker Sandbox

<p align="center">
  <strong>A full-stack online judge for coding practice, secure C++ submission execution, problem management, leaderboards, and authenticated user workflows.</strong>
</p>

<p align="center">
  <img alt="Stack" src="https://img.shields.io/badge/Stack-MERN-47A248?style=for-the-badge" />
  <img alt="Runtime" src="https://img.shields.io/badge/Runtime-Node.js-339933?style=for-the-badge" />
  <img alt="Sandbox" src="https://img.shields.io/badge/Sandbox-Ephemeral%20Docker-2496ED?style=for-the-badge" />
  <img alt="Database" src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge" />
</p>

---

## 📌 Overview

Online Judge is a MERN-stack platform where users can register, browse programming problems, submit C++ solutions, receive automated verdicts, and review leaderboard activity. The backend now uses **per-submission ephemeral Docker containers** instead of a shared long-running container, giving every submission its own isolated workspace and runtime boundary.

The judge currently supports C++17 submissions and returns standard competitive-programming verdicts:

| Verdict | Meaning |
|---|---|
| `AC` | Accepted |
| `WA` | Wrong Answer |
| `TLE` | Time Limit Exceeded |
| `RE` | Runtime Error |
| `CE` | Compilation Error |

---

## 🎯 Motivation

Online judges execute untrusted code. A shared execution container such as `oj-gcc` is convenient for demos, but it creates serious production risks:

- Submissions can share filesystem state.
- One malicious or buggy program can affect later submissions.
- Concurrent submissions can collide on filenames.
- Cleanup is fragile because the container persists across requests.
- Isolation boundaries are too weak for a real judge.

This refactor replaces that approach with a safer model: **one temporary directory and one temporary Docker container per submission test run**. Containers are removed immediately after execution, networking is disabled, CPU and memory are limited, and temporary host files are deleted in `finally` cleanup blocks.

---

## ✨ Features

### ✅ Current Features

| Area | Capability |
|---|---|
| Authentication | Register, login, logout with bcrypt password hashing and JWT cookies |
| Problem API | Create, update, delete, list, and fetch problems |
| Test Cases | Add, fetch, and delete problem test cases |
| Judging | Compile and execute C++17 submissions in isolated Docker containers |
| Verdicts | `AC`, `WA`, `TLE`, `RE`, `CE` |
| Leaderboard | Displays recent submissions with user and problem metadata |
| Profile | Authenticated user profile with recent submissions |
| Security | httpOnly cookies, no-network Docker runs, CPU/memory limits, PID limit, read-only root filesystem |

### 🚧 Planned Features

| Feature | Why it matters |
|---|---|
| Redis Queue | Buffer burst traffic and decouple API requests from judge workers |
| BullMQ Workers | Process submissions reliably with retries and concurrency control |
| WebSockets | Stream live verdict updates to users |
| Contest Support | Timed contests, scoreboards, freeze windows, and problem sets |
| Rating System | Elo-style or Codeforces-style rating progression |
| Admin Dashboard | Safer problem/testcase management for maintainers |
| Multi-language Support | Add Python, Java, JavaScript, and language-specific limits |
| Kubernetes Workers | Horizontally scale isolated judge workers in production |

---

## 🏗️ Architecture

### Current Application Architecture

```text
┌──────────────┐
│    React     │
│  Frontend    │
└──────┬───────┘
       │ HTTP + Cookies
       ▼
┌──────────────┐
│   Express    │
│     API      │
└──────┬───────┘
       │ Mongoose
       ▼
┌──────────────┐
│   MongoDB    │
│  Database    │
└──────────────┘

          ┌──────────────────────────┐
          │      Docker Judge        │
          │ Ephemeral C++ Containers │
          └──────────────────────────┘
```

### Production Target Architecture

```text
┌──────────────┐
│    React     │
│  Frontend    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│     API      │
│   Express    │
└──────┬───────┘
       │ enqueue submission
       ▼
┌──────────────┐
│ Redis Queue  │
│   BullMQ     │
└──────┬───────┘
       │ jobs
       ▼
┌──────────────┐
│   Workers    │
│ Judge Nodes  │
└──────┬───────┘
       │ create/run/destroy
       ▼
┌──────────────────────┐
│ Ephemeral Containers │
│  C++ / Python / Java │
└──────────────────────┘
```

---

## 🔄 Submission Flow

```text
┌────────┐
│  User  │
└───┬────┘
    │
    ▼
┌──────────────┐
│ Submit Code  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Auth Cookie  │
│ JWT Verify   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Fetch Tests  │
│ from MongoDB │
└──────┬───────┘
       │
       ▼
┌────────────────────┐
│ Container Creation │
│ --network none     │
│ --memory=128m      │
│ --cpus=1           │
└──────┬─────────────┘
       │
       ▼
┌──────────────┐
│ Compile C++  │
│ g++ C++17    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Execute Code │
│ 2s Timeout   │
└──────┬───────┘
       │
       ▼
┌────────────────┐
│ Compare Output │
└──────┬─────────┘
       │
       ▼
┌──────────────┐
│   Verdict    │
│ AC/WA/TLE/RE │
│      /CE     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Database    │
│ Save Solution│
└──────────────┘
```

---

## 🐳 Docker Isolation Model

###  Old Model: Shared Persistent Container

```text
Submission A ─┐
Submission B ─┼──► one shared container: oj-gcc
Submission C ─┘        │
                       └── shared /tmp, shared process namespace, shared lifecycle
```

###  New Model: Per-Submission Ephemeral Containers

```text
Submission A ─────────► Container A ─────────► removed
Submission B ─────────► Container B ─────────► removed
Submission C ─────────► Container C ─────────► removed

Each run gets:
  • unique random temp directory
  • unique Docker container name
  • mounted workspace only
  • disabled network
  • memory / CPU / PID limits
  • automatic cleanup
```

### Docker Runtime Controls

The executor runs Docker with the following production-oriented restrictions:

| Control | Purpose |
|---|---|
| `--rm` | Remove the container after the run exits |
| `--network none` | Prevent internet and service discovery access |
| `--memory=128m` | Limit memory usage per submission |
| `--cpus=1` | Limit CPU allocation per submission |
| `--pids-limit=64` | Limit fork/process explosion |
| `--read-only` | Keep the container root filesystem immutable |
| `--tmpfs /tmp` | Provide a small temporary compiler workspace |
| `--security-opt no-new-privileges` | Prevent privilege escalation |
| `--cap-drop ALL` | Drop Linux capabilities not needed for compilation/execution |
| bind mount `/judge` only | Expose only the submission workspace to the container |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | bcryptjs, JWT, httpOnly cookies |
| Sandbox | Docker, GCC C++17 image |
| Runtime | Node.js async/await |

---

## 📁 Repository Structure

```text
Online-Judge/
├── client/                         # React frontend placeholder/source tree
├── docker/
│   └── Dockerfile.gcc              # Optional GCC judge image definition
├── server/
│   ├── constants/
│   │   └── verdicts.js             # Verdict constants and labels
│   ├── controllers/                # Express controller logic
│   ├── executors/
│   │   ├── docker/dockerCommand.js # Safe Docker process wrapper
│   │   ├── utils/output.js         # Output normalization helpers
│   │   └── runCode.js              # Ephemeral Docker execution engine
│   ├── middleware/                 # JWT auth middleware
│   ├── models/                     # Mongoose schemas
│   ├── routes/                     # API routes
│   ├── index.js                    # Server entry point
│   ├── package.json
│   └── package-lock.json
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- Docker Engine
- MongoDB connection string

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd Online-Judge
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Update `.env`:

```env
MONGO_URI=mongodb://localhost:27017/online_judge
JWT_SECRET=replace_with_a_long_random_secret
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
JUDGE_DOCKER_IMAGE=gcc:13
JUDGE_DOCKER_TIMEOUT_MS=20000
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Pull or build the judge image

Use the upstream GCC image:

```bash
docker pull gcc:13
```

Or build the repository image:

```bash
docker build -f docker/Dockerfile.gcc -t online-judge-gcc:13 .
```

If you build the repository image, set:

```env
JUDGE_DOCKER_IMAGE=online-judge-gcc:13
```

### 5. Start the API

```bash
cd server
npm run dev
```

The API will start on `http://localhost:5000` by default.

---

## 🔌 API Documentation

> Base URL: `http://localhost:5000/api`
>
> Authenticated endpoints use the `token` httpOnly cookie returned by `/auth/register` or `/auth/login`.


| Requested operation | Implemented route | Notes |
|---|---|---|
| `POST /register` | `POST /api/auth/register` | Register and set cookie |
| `POST /login` | `POST /api/auth/login` | Login and set cookie |
| `GET /problems` | `GET /api/problems` | Public problem list |
| `GET /problems/:id` | `GET /api/problems/:id` | Public problem detail |
| `POST /submit` | `POST /api/submit` | Protected submission endpoint |
| `GET /leaderboard` | `GET /api/leaderboard` | Recent submissions |
| `GET /profile` | `GET /api/profile` | Protected user profile |

### POST `/auth/register`

Creates a user, hashes the password with bcrypt, signs a JWT, and sets it as an httpOnly cookie.

**Request**

```json
{
  "fullName": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "StrongPassword123!",
  "dob": "1815-12-10"
}
```

**Response `201`**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "65f1a5d0e7a1a4d8a51c1111",
    "fullName": "Ada Lovelace",
    "email": "ada@example.com"
  }
}
```

### POST `/auth/login`

Authenticates a user and sets the JWT cookie.

**Request**

```json
{
  "email": "ada@example.com",
  "password": "StrongPassword123!"
}
```

**Response `200`**

```json
{
  "message": "Login successful",
  "user": {
    "id": "65f1a5d0e7a1a4d8a51c1111",
    "fullName": "Ada Lovelace",
    "email": "ada@example.com"
  }
}
```

### GET `/problems`

Returns a lightweight list of problems.

**Response `200`**

```json
[
  {
    "_id": "65f1a5d0e7a1a4d8a51c2222",
    "name": "Two Sum",
    "code": "TWO-SUM",
    "difficulty": "Easy"
  }
]
```

### GET `/problems/:id`

Returns one problem by MongoDB ObjectId.

**Response `200`**

```json
{
  "_id": "65f1a5d0e7a1a4d8a51c2222",
  "name": "Two Sum",
  "statement": "Given two integers, print their sum.",
  "code": "TWO-SUM",
  "difficulty": "Easy"
}
```

### POST `/submit`

Submits C++ code for judging. This endpoint is protected.

**Request**

```json
{
  "problemId": "65f1a5d0e7a1a4d8a51c2222",
  "code": "#include <iostream>\nusing namespace std;\nint main(){ long long a,b; cin>>a>>b; cout << a+b << '\\n'; }"
}
```

**Response `200` — Accepted**

```json
{
  "verdict": "AC",
  "verdictLabel": "Accepted",
  "solutionId": "65f1a5d0e7a1a4d8a51c3333"
}
```

**Response `200` — Compilation Error**

```json
{
  "verdict": "CE",
  "verdictLabel": "Compilation Error",
  "solutionId": "65f1a5d0e7a1a4d8a51c3334",
  "error": "source.cpp: In function 'int main()': ..."
}
```

### GET `/leaderboard`

Returns the most recent submissions with populated user and problem information.

**Response `200`**

```json
[
  {
    "_id": "65f1a5d0e7a1a4d8a51c3333",
    "verdict": "AC",
    "submitted_at": "2026-06-02T10:00:00.000Z",
    "user": {
      "fullName": "Ada Lovelace",
      "email": "ada@example.com"
    },
    "problem": {
      "name": "Two Sum",
      "code": "TWO-SUM"
    }
  }
]
```

### GET `/profile`

Returns the authenticated user profile and recent submissions.

**Response `200`**

```json
{
  "user": {
    "_id": "65f1a5d0e7a1a4d8a51c1111",
    "fullName": "Ada Lovelace",
    "email": "ada@example.com",
    "dob": "1815-12-10T00:00:00.000Z"
  },
  "recentSubmissions": [
    {
      "_id": "65f1a5d0e7a1a4d8a51c3333",
      "verdict": "AC",
      "problem": {
        "name": "Two Sum",
        "code": "TWO-SUM",
        "difficulty": "Easy"
      }
    }
  ]
}
```

---

## 🗃️ Database Schema

### Users

```js
{
  fullName: String,          // required
  email: String,             // required, unique
  password: String,          // required, bcrypt hash
  dob: Date                  // optional
}
```

### Problems

```js
{
  name: String,              // required
  statement: String,         // required
  code: String,              // required
  difficulty: 'Easy' | 'Medium' | 'Hard'
}
```

### TestCases

```js
{
  input: String,             // required
  output: String,            // required
  problem: ObjectId          // ref: Problem, required
}
```

### Solutions

```js
{
  problem: ObjectId,         // ref: Problem, required
  user: ObjectId,            // ref: User, required
  verdict: String,           // AC | WA | TLE | RE | CE | SE
  submitted_at: Date         // default: Date.now
}
```

### Relationships

```text
Users    1 ──── * Solutions
Problems 1 ──── * Solutions
Problems 1 ──── * TestCases
```

---

## 🔐 Security

### Authentication Security

| Control | Implementation |
|---|---|
| Password hashing | bcrypt with generated salt |
| Session token | JWT signed with `JWT_SECRET` |
| Cookie transport | `httpOnly` cookie to reduce client-side token exposure |
| Route protection | `verifyToken` middleware reads and verifies the cookie |

### Execution Security

| Risk | Mitigation |
|---|---|
| Network abuse | Docker runs with `--network none` |
| Host file access | Only the random workspace directory is mounted |
| Memory abuse | Docker runs with `--memory=128m` |
| CPU abuse | Docker runs with `--cpus=1` |
| Fork bombs | Docker runs with `--pids-limit=64` |
| Persistent contamination | Containers use `--rm`; temp files are removed in `finally` |
| Root filesystem writes | Docker runs with `--read-only` and small `/tmp` tmpfs |
| Privilege escalation | `--security-opt no-new-privileges` and `--cap-drop ALL` |

> Important: Docker sandboxing is a major improvement over direct host execution, but high-stakes production judges should add dedicated worker hosts, seccomp/AppArmor profiles, queue isolation, audit logging, and continuous patching.

---

## 🧪 Judging Semantics

For each test case, the API:

1. Creates a unique temp directory using timestamp + UUID entropy.
2. Writes `source.cpp` and `input.txt` into that directory.
3. Starts a new Docker container with strict runtime limits.
4. Compiles with `g++ -std=c++17 -O2 -pipe`.
5. Executes with a 2-second timeout.
6. Captures stdout/stderr.
7. Normalizes trailing whitespace and compares with expected output.
8. Returns the first failing verdict or `AC` when every test passes.
9. Saves the solution record to MongoDB.
10. Removes the Docker container and temp directory.

---

## 🧭 Migration Notes

If you previously used a persistent container named `oj-gcc`, remove that workflow.

### Remove old shared-container assumptions

Do not start or rely on:

```bash
docker run --name oj-gcc ...
docker cp ... oj-gcc:/tmp/...
docker exec oj-gcc ...
```

### Use image-based execution instead

The server now expects only a Docker image name:

```env
JUDGE_DOCKER_IMAGE=gcc:13
```

Each submission run creates and removes its own container automatically.

### Verdict format change

Verdicts are now stored as short codes:

| Previous style | New code |
|---|---|
| Accepted | `AC` |
| Wrong Answer | `WA` |
| Time Limit Exceeded | `TLE` |
| Runtime Error | `RE` |
| Compilation Error | `CE` |

If your frontend displays long labels, use the `verdictLabel` field returned by `/submit` or map codes client-side.

---

## ⚠️ Known Limitations

### Current State

- C++17 is the only supported language.
- Submissions are judged synchronously inside the API request lifecycle.
- There is no Redis/BullMQ queue yet.
- Test cases are simple input/output pairs without hidden/visible grouping.
- There is no admin role model yet; protected problem routes only require authentication.
- The React client directory is present, but this repository snapshot focuses primarily on the backend API and judge architecture.

### Production Improvements Needed

- Move judging into isolated worker processes or dedicated worker machines.
- Add a queue to protect the API from burst submission load.
- Add per-language compile and execution limits.
- Add stronger Linux sandbox profiles such as seccomp and AppArmor.
- Add structured logging, metrics, tracing, and alerting.
- Store source code and per-test execution metadata for auditability.
- Add CI tests for controllers, auth, model validation, and executor behavior.

### Future Work

- Redis Queue
- BullMQ
- WebSockets
- Contest Support
- Rating System
- Admin Dashboard
- Multi-language Support
- Kubernetes Workers

---

## 🤝 Contributing

Contributions are welcome. Suggested contribution areas:

- Add unit and integration tests.
- Implement BullMQ-backed asynchronous judging.
- Add frontend pages for profile and submission history.
- Add multi-language execution profiles.
- Improve security hardening with seccomp/AppArmor.

Before opening a pull request, run backend syntax checks and ensure Docker is available for executor testing.

---

## 📄 License

This project currently uses the ISC license declared in the backend package metadata.
