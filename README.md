
# ⚖️ Online Judge
 
<p align="center">
  <strong>A full-stack competitive programming platform built with the MERN stack — featuring ephemeral Docker sandboxing, JWT authentication, and an automated C++17 judging pipeline.</strong>
</p>
<p align="center">
  <img alt="Stack" src="https://img.shields.io/badge/Stack-MERN-47A248?style=for-the-badge" />
  <img alt="Runtime" src="https://img.shields.io/badge/Runtime-Node.js-339933?style=for-the-badge" />
  <img alt="Sandbox" src="https://img.shields.io/badge/Sandbox-Ephemeral%20Docker-2496ED?style=for-the-badge" />
  <img alt="Database" src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge" />
  <img alt="Auth" src="https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge" />
</p>
---
 
## 📌 Overview
 
Online Judge is a MERN-stack platform where users register, browse programming problems, submit C++ solutions, receive automated verdicts, and track their performance on a leaderboard. The backend uses **per-submission ephemeral Docker containers** — every submission gets its own isolated workspace, network-disabled runtime, and automatic cleanup.
 
### Supported Verdicts
 
| Code | Meaning |
|---|---|
| `AC` | Accepted |
| `WA` | Wrong Answer |
| `TLE` | Time Limit Exceeded |
| `RE` | Runtime Error |
| `CE` | Compilation Error |
| `SE` | System Error |
 
---
 
## 🎯 Why Ephemeral Containers
 
Online judges execute untrusted user code. A shared persistent container creates serious risks:
 
- Submissions share filesystem state — one run can affect the next
- Concurrent submissions collide on filenames
- A buggy or malicious program can corrupt the shared environment
- Cleanup is fragile when the container persists across requests
This project uses a safer model: **one temporary directory and one Docker container per submission**. Containers are removed immediately after execution. Networking is disabled. CPU, memory, and PID limits are enforced. Temp files are deleted in `finally` blocks.
 
---
 
## ✨ Features
 
### Current
 
| Area | Capability |
|---|---|
| Authentication | Register, login, logout with bcrypt + JWT httpOnly cookies |
| Problems | Create, update, delete, list, and fetch problems |
| Test Cases | Add, fetch, and delete test cases per problem |
| Judging | C++17 compilation and execution in isolated ephemeral Docker containers |
| Verdicts | `AC`, `WA`, `TLE`, `RE`, `CE`, `SE` |
| Leaderboard | Ranked by accepted submissions with user and problem metadata |
| Profile | Authenticated user profile with submission history and verdict stats |
| Security | httpOnly cookies, no-network Docker, CPU/memory/PID limits, read-only rootfs |
 
### Planned
 
| Feature | Purpose |
|---|---|
| Redis + BullMQ | Async submission queue — decouple API from judge workers |
| WebSockets | Stream live verdict updates instead of polling |
| Contest Mode | Timed contests, scoreboards, freeze windows |
| Rating System | Codeforces-style rating progression |
| Admin Dashboard | Role-based problem and test case management |
| Multi-language | Python, Java, JavaScript support with per-language limits |
| Kubernetes Workers | Horizontally scalable judge nodes |
 
---
 
## 🏗️ Architecture
 
### Current
 
```
┌──────────────┐
│    React     │
│  Frontend    │
└──────┬───────┘
       │ HTTP + Cookies (Axios)
       ▼
┌──────────────────────────────┐
│       Express.js API         │
│                              │
│  cors → json → cookieParser  │
│  verifyToken (JWT middleware) │
│  Routes → Controllers        │
└──────┬───────────────┬───────┘
       │               │
       ▼               ▼
┌──────────────┐  ┌──────────────────────────┐
│   MongoDB    │  │      Docker Judge         │
│   Atlas      │  │  Ephemeral C++ Containers │
│              │  │                           │
│  users       │  │  unique workdir per run   │
│  problems    │  │  g++ -std=c++17 compile   │
│  solutions   │  │  2s execution timeout     │
│  test_cases  │  │  --rm auto cleanup        │
└──────────────┘  └──────────────────────────┘
```
 
### Production Target
 
```
┌──────────────┐
│    React     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Express API │
└──────┬───────┘
       │ enqueue
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
 
## 🔄 Submission Pipeline
 
```
User submits C++ code
        │
        ▼
POST /api/submit  →  verifyToken (JWT cookie)
        │
        ├─ Validate request body (problemId, code)
        ├─ Problem.findById() → 404 if not found
        ├─ TestCase.find({ problem }) → 400 if empty
        │
        ├─ For each test case:
        │     │
        │     ├─ mkdtemp() → unique temp directory
        │     ├─ Write source.cpp + input.txt
        │     │
        │     ├─ docker run --rm --network none --memory 128m
        │     │            --cpus 1 --pids-limit 64
        │     │            --read-only --cap-drop ALL
        │     │
        │     ├─ g++ -std=c++17 -O2 source.cpp → compile.stderr
        │     │     └─ exit 100 → CE → break
        │     │
        │     ├─ timeout 2s ./solution < input.txt
        │     │     ├─ exit 124/137 → TLE → break
        │     │     └─ non-zero exit → RE → break
        │     │
        │     ├─ normalizeOutput(stdout) vs normalizeOutput(expected)
        │     │     └─ mismatch → WA → break
        │     │
        │     └─ finally: rm container + rm workdir
        │
        ├─ All passed → AC
        ├─ Solution.create({ problem, user, verdict })
        └─ Return { verdict, verdictLabel, solutionId }
```
 
---
 
## ⚡ Async Queue — Handling Concurrent Submissions
 
At scale, running Docker executions synchronously inside API requests overwhelms the server. The solution is a **message queue**:
 
```
1000 users submit simultaneously
        │
        ▼
All submissions enter a FIFO queue
        │
        ▼
Fixed worker pool processes jobs one by one
        │
        ▼
Verdict saved → user sees "pending" → result appears
```
 
This is how Codeforces works — you see **"In Queue"** before getting a verdict. The queue decouples incoming load from the execution system.
 
**Current:** Synchronous per request — sufficient for development and low traffic.  
**Production:** Bull + Redis queue with configurable worker concurrency.
 
---
 
## 🐳 Docker Isolation Model
 
### Old: Shared Persistent Container
 
```
Submission A ─┐
Submission B ─┼──► oj-gcc (shared forever)
Submission C ─┘    └── shared /tmp, shared process space
```
 
### New: Per-Submission Ephemeral Containers
 
```
Submission A ──► Container A (uuid) ──► removed automatically
Submission B ──► Container B (uuid) ──► removed automatically
Submission C ──► Container C (uuid) ──► removed automatically
```
 
### Docker Runtime Controls
 
| Flag | Purpose |
|---|---|
| `--rm` | Auto-remove container after exit |
| `--network none` | No internet or service access |
| `--memory=128m` | Memory cap per submission |
| `--cpus=1` | CPU cap per submission |
| `--pids-limit=64` | Prevents fork bombs |
| `--read-only` | Immutable root filesystem |
| `--tmpfs /tmp` | Small writable scratch space for compiler |
| `--security-opt no-new-privileges` | No privilege escalation |
| `--cap-drop ALL` | Drop all Linux capabilities |
| bind mount `/judge` only | Container sees only submission workspace |
 
---
 
## 🔐 Auth Flow
 
```
Register:
  POST /api/auth/register
    → collectMissingFields() validation
    → User.findOne({ email }) → 409 if duplicate
    → bcrypt.genSalt(10) + bcrypt.hash(password)
    → User.create(...)
    → jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
    → res.cookie('token', jwt, { httpOnly: true, sameSite: 'lax' })
 
Login:
  POST /api/auth/login
    → User.findOne({ email })
    → bcrypt.compare(password, user.password)
    → identical "Invalid credentials" for both failures (prevents user enumeration)
    → jwt.sign(...) → res.cookie(...)
 
Protected Routes:
  verifyToken middleware
    → req.cookies.token
    → jwt.verify(token, JWT_SECRET)
    → req.user = decoded → next()
    → invalid/missing → 401
```
 
**Why httpOnly Cookie over localStorage:**
`localStorage` is readable by any JavaScript — XSS steals the token. `httpOnly` cookies are invisible to JavaScript — browsers send them automatically, attackers cannot read them.
 
---
 
## 🗃️ Database Schema
 
### users
```js
{
  fullName:    String,   // required
  email:       String,   // required, unique
  password:    String,   // required, bcrypt hash
  dob:         Date
}
```
 
### problems
```js
{
  name:        String,   // required
  statement:   String,   // required
  code:        String,   // required, e.g. "P001"
  difficulty:  String    // 'Easy' | 'Medium' | 'Hard'
}
```
 
### test_cases
```js
{
  input:       String,   // required
  output:      String,   // required
  problem:     ObjectId  // ref: Problem, required
}
```
 
### solutions
```js
{
  problem:      ObjectId, // ref: Problem, required
  user:         ObjectId, // ref: User, required
  verdict:      String,   // AC | WA | TLE | RE | CE | SE
  submitted_at: Date      // default: Date.now
}
```
 
### Relationships
```
users    1 ──── * solutions
problems 1 ──── * solutions
problems 1 ──── * test_cases
```
 
---
 
## 🔌 API Reference
 
> Base URL: `http://localhost:5000/api`  
> Protected endpoints require the `token` httpOnly cookie set by `/auth/login`.
 
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, sets JWT cookie |
| POST | `/auth/logout` | No | Clears JWT cookie |
| GET | `/problems` | No | List all problems |
| GET | `/problems/:id` | No | Get problem by ID |
| POST | `/problems` | Yes | Create problem |
| PUT | `/problems/:id` | Yes | Update problem |
| DELETE | `/problems/:id` | Yes | Delete problem |
| POST | `/testcases` | Yes | Add test case |
| GET | `/testcases/:problemId` | No | Get test cases |
| DELETE | `/testcases/:id` | Yes | Delete test case |
| POST | `/submit` | Yes | Submit code for judging |
| GET | `/leaderboard` | No | Get leaderboard |
| GET | `/profile` | Yes | Get user profile + stats |
 
### POST `/auth/register`
```json
// Request
{ "fullName": "Mayank", "email": "mayank@test.com", "password": "test1234", "dob": "2004-01-01" }
 
// Response 201
{ "success": true, "message": "User registered successfully", "data": { "user": { "id": "...", "fullName": "Mayank", "email": "mayank@test.com" } } }
```
 
### POST `/submit`
```json
// Request
{ "problemId": "65f1a5d0e7a1a4d8a51c2222", "code": "#include<iostream>..." }
 
// Response 200 — Accepted
{ "success": true, "message": "Submission judged", "data": { "verdict": "AC", "verdictLabel": "Accepted", "solutionId": "...", "failedTestCase": null } }
 
// Response 200 — Wrong Answer
{ "success": true, "message": "Submission judged", "data": { "verdict": "WA", "verdictLabel": "Wrong Answer", "solutionId": "...", "failedTestCase": 1 } }
 
// Response 200 — Compilation Error
{ "success": true, "message": "Submission judged", "data": { "verdict": "CE", "verdictLabel": "Compilation Error", "solutionId": "...", "error": "source.cpp:1:1: error..." } }
```
 
---
 
## 📁 Repository Structure
 
```
Online-Judge/
├── client/                          # React frontend
├── docker/
│   └── Dockerfile.gcc               # GCC judge image definition
├── server/
│   ├── constants/
│   │   └── verdicts.js              # Verdict codes and labels
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── problemController.js
│   │   ├── submissionController.js
│   │   ├── leaderboardController.js
│   │   ├── testCaseController.js
│   │   └── profileController.js
│   ├── executors/
│   │   ├── docker/
│   │   │   └── dockerCommand.js     # spawn wrapper for Docker CLI
│   │   ├── utils/
│   │   │   └── output.js            # Output normalization
│   │   └── runCode.js               # Ephemeral container execution engine
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Problem.js
│   │   ├── Solution.js
│   │   └── TestCase.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── problems.js
│   │   ├── submit.js
│   │   ├── leaderboard.js
│   │   ├── testCases.js
│   │   └── profile.js
│   ├── utils/
│   │   ├── response.js              # sendSuccess / sendError helpers
│   │   └── validation.js            # Input validation helpers
│   └── index.js                     # Server entry point
├── .env.example
├── .gitignore
└── README.md
```
 
---
 
## ⚙️ Local Setup
 
### Prerequisites
 
- Node.js 18+
- npm
- Docker Desktop
- MongoDB Atlas account (free tier works)
### 1. Clone
 
```bash
git clone https://github.com/Mikey3600/Online-Judge.git
cd Online-Judge
```
 
### 2. Configure environment
 
```bash
cd server
cp .env.example .env
```
 
Edit `.env`:
 
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/onlinejudge
JWT_SECRET=your_long_random_secret_here
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
JUDGE_DOCKER_IMAGE=gcc:13
JUDGE_DOCKER_TIMEOUT_MS=20000
```
 
### 3. Install dependencies
 
```bash
npm install
```
 
### 4. Pull judge image
 
```bash
docker pull gcc:13
```
 
### 5. Start server
 
```bash
npm run dev
```
 
API runs at `http://localhost:5000`
 
### 6. Start frontend (Day 8+)
 
```bash
cd ../client
npm install
npm start
```
 
---
 
## 🛡️ Security
 
| Control | Implementation |
|---|---|
| Password hashing | bcrypt with salt rounds = 10 |
| Session token | JWT, expires in 7 days |
| Cookie transport | `httpOnly` + `sameSite: lax` |
| User enumeration prevention | Identical error for wrong email and wrong password |
| Route protection | `verifyToken` middleware on all protected routes |
| Network isolation | `--network none` per Docker container |
| Memory isolation | `--memory=128m` per container |
| CPU isolation | `--cpus=1` per container |
| Fork bomb prevention | `--pids-limit=64` |
| Privilege escalation | `--security-opt no-new-privileges` + `--cap-drop ALL` |
| Filesystem isolation | `--read-only` root + tmpfs for compiler scratch |
 
---
 

 
## ⚠️ Known Limitations
 
- C++17 only — no Python, Java, or other languages yet
- Submissions judged synchronously — no queue yet
- No admin role — any authenticated user can create/edit problems
- No hidden test cases or test case grouping
- No source code storage per submission
---
 
## 🚀 Future Scope
 
- **Contests** — timed competitions with scoreboards and freeze windows
- **Plagiarism Detection** — MOSS integration for similarity checks
- **Rating System** — Codeforces-style rating progression
- **Custom Test Cases** — users can test against their own inputs before submitting
- **Discussions** — per-problem editorial and comment threads
- **Multi-language** — Python, Java, JavaScript with per-language time/memory limits
- **Redis + BullMQ** — async submission queue for production scale
- **Kubernetes** — horizontally scalable judge worker nodes
---
 
## 📚 References
 
- [Docker GCC Image](https://hub.docker.com/_/gcc)
- [Docker Security — Cap Drop](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities)
- [isolate — IOI Sandbox](https://github.com/ioi/isolate)
- [Node child_process docs](https://nodejs.org/api/child_process.html)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [BullMQ](https://docs.bullmq.io/)
---
 
## 👤 Author
 
**Mayank** — CS Undergraduate, KIIT  
GitHub: [@Mikey3600](https://github.com/Mikey3600)
 
---
