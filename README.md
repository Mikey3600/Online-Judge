# ⚖️ Online Judge
 
> A full-stack competitive programming platform — built from scratch using the MERN stack with Docker-sandboxed code execution, JWT authentication, and an async submission pipeline.
 
---
 
## 📌 Project Overview
 
An Online Judge (OJ) is a platform that hosts coding competitions where participants submit solutions that are automatically evaluated against hidden test cases. This project replicates core features of platforms like Codeforces and Codechef — built as a college project at KIIT under faculty guidance.
 
The system handles three core real-world engineering challenges:
 
| Challenge | Solution |
|---|---|
| **Thundering Herd** — thousands of simultaneous submissions | Async message queue — submissions queued, processed one by one |
| **Malicious Code** — user uploads harmful code | Docker containers — isolated, memory-limited, time-limited |
| **Verdict Integrity** — unauthorized manipulation of results | JWT-based auth + middleware-protected routes |
 
---
 
## 🧱 Tech Stack
 
| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Code Execution | Docker (GCC container) |
| Process Spawning | Node.js `child_process` |
| Version Control | Git + GitHub |
 
---
 
## ✨ Features
 
- 🔐 User Registration and Login with JWT-based session management
- 📋 Problem listing with difficulty tags
- 🧩 Individual problem view with in-browser code editor
- 🚀 Code submission with real-time verdict (Accepted / Wrong Answer / TLE / Runtime Error / Compilation Error)
- 🐳 Docker-sandboxed execution — memory-limited, time-limited, isolated
- 🏆 Leaderboard showing last 10 submissions with verdicts
- 👤 User profile with submission history
---
 
## 🗂️ Project Structure
 
```
online-judge/
│
├── client/                   # React frontend
│   ├── public/
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── pages/            # Home, Problem, Leaderboard, Profile
│       ├── context/          # Auth context (JWT state)
│       └── api/              # Axios API calls
│
├── server/                   # Express backend
│   ├── models/               # Mongoose schemas
│   │   ├── Problem.js
│   │   ├── Solution.js
│   │   ├── TestCase.js
│   │   └── User.js
│   ├── routes/               # API route definitions
│   │   ├── auth.js
│   │   ├── problems.js
│   │   ├── solutions.js
│   │   ├── leaderboard.js
│   │   └── testCases.js
│   ├── controllers/          # Business logic
│   │   ├── authController.js
│   │   ├── problemController.js
│   │   ├── submissionController.js
│   │   ├── leaderboardController.js
│   │   └── testCaseController.js
│   ├── middleware/
│   │   └── auth.js           # JWT verification
│   ├── executors/            # Docker execution logic
│   │   └── runCode.js        # docker cp + docker exec
│   └── index.js              # Entry point
│
├── docker/
│   └── Dockerfile.gcc        # GCC container config
│
├── .env.example
├── .gitignore
└── README.md
```
 
---
 
## 🗃️ Database Design
 
### Collection 1 — `problems`
```json
{
  "name": "String",
  "statement": "String",
  "code": "String",
  "difficulty": "Easy | Medium | Hard"
}
```
 
### Collection 2 — `solutions`
```json
{
  "problem": "ObjectId → ref problems",
  "user": "ObjectId → ref users",
  "verdict": "Accepted | Wrong Answer | TLE | CE | RE",
  "submitted_at": "Date (auto)"
}
```
 
### Collection 3 — `test_cases`
```json
{
  "input": "String",
  "output": "String",
  "problem": "ObjectId → ref problems"
}
```
 
### Collection 4 — `users`
```json
{
  "fullName": "String",
  "email": "String (unique)",
  "password": "String (bcrypt hashed)",
  "dob": "Date"
}
```
 
**Relationships:**
```
problems ──── test_cases   (one problem → many test cases)
problems ──── solutions    (one problem → many submissions)
users    ──── solutions    (one user → many submissions)
```
 
---
 
## 🏗️ System Architecture
 
```
                        ┌─────────────────────────────┐
                        │        React Frontend         │
                        │   (Problem List / Editor /    │
                        │    Leaderboard / Profile)     │
                        └────────────┬────────────────┘
                                     │ HTTP (Axios + Cookie)
                                     ▼
                        ┌─────────────────────────────┐
                        │      Express.js API Server   │
                        │                              │
                        │  cors → json → cookieParser  │
                        │         ↓                    │
                        │     verifyToken (JWT)        │
                        │         ↓                    │
                        │  Routes → Controllers        │
                        └──────┬──────────────┬───────┘
                               │              │
                               ▼              ▼
                   ┌──────────────┐   ┌──────────────────┐
                   │  MongoDB     │   │  Docker Executor  │
                   │  Atlas       │   │  (GCC Container)  │
                   │              │   │                   │
                   │  problems    │   │  docker cp code   │
                   │  solutions   │   │  g++ compile      │
                   │  test_cases  │   │  run + compare    │
                   │  users       │   │  return verdict   │
                   └──────────────┘   └──────────────────┘
```
 
---
 
## 🔄 Submission Pipeline
 
```
User submits C++ code
        │
        ▼
POST /api/solutions/submit
        │
        ├─ verifyToken → extract userId from JWT cookie
        │
        ├─ Problem.findById(problemId) → 404 if not found
        │
        ├─ TestCase.find({ problem }) → 400 if no test cases
        │
        ├─ For each test case:
        │     │
        │     ├─ Write code → temp file (timestamped)
        │     ├─ docker cp → copy into oj-gcc container
        │     ├─ docker exec → g++ compile
        │     │     └─ Compilation Error → break
        │     ├─ docker exec → run with input (2s timeout)
        │     │     ├─ killed → Time Limit Exceeded → break
        │     │     └─ crashed → Runtime Error → break
        │     └─ output.trim() !== expected.trim() → Wrong Answer → break
        │
        ├─ All test cases passed → Accepted
        │
        ├─ Solution.create({ problem, user, verdict }) → save to DB
        │
        └─ Return { verdict, solutionId } to frontend
```
 
---
 
## ⚡ Async Queue — Handling Concurrent Submissions
 
When thousands of users submit simultaneously, running all Docker executions in parallel would overwhelm the server. The solution is an **async message queue**:
 
```
1000 users submit at once
        │
        ▼
All submissions enter a queue (FIFO)
        │
        ▼
Worker picks submissions one by one
        │
        ▼
Each runs through Docker pipeline
        │
        ▼
Verdict saved → user notified (was "pending" until processed)
```
 
This is exactly how Codeforces works — you see **"In Queue"** before getting a verdict. The queue buffers incoming load so the execution system is never overwhelmed.
 
**Current state:** Synchronous per request — sufficient for development.  
**Production upgrade:** Bull + Redis queue with fixed worker pool.
 
---
 
## 🔐 Auth Flow
 
```
Register:
  POST /api/auth/register
    → check email uniqueness
    → bcrypt.hash(password, salt=10)
    → User.create(...)
    → jwt.sign({ userId }, SECRET, { expiresIn: '7d' })
    → res.cookie('token', jwt, { httpOnly: true })
 
Login:
  POST /api/auth/login
    → User.findOne({ email })
    → bcrypt.compare(password, user.password)
    → both failures → "Invalid credentials" (prevents user enumeration attack)
    → jwt.sign(...) → res.cookie(...)
 
Protected Routes:
  verifyToken middleware
    → reads req.cookies.token
    → jwt.verify(token, SECRET)
    → sets req.user = decoded payload
    → calls next() or returns 401
```
 
**Why httpOnly Cookie over localStorage:**
- `localStorage` is readable by any JS on the page — XSS steals the token
- `httpOnly` cookie is invisible to JavaScript — browser sends it automatically, attackers cannot read it
---
 
## 🐳 Docker Execution
 
```bash
# One-time container setup
docker run -d --name oj-gcc --restart unless-stopped gcc sleep infinity
 
# Per submission (called from Node child_process)
docker cp solution_<timestamp>.cpp oj-gcc:/tmp/
docker exec oj-gcc g++ /tmp/solution_<timestamp>.cpp -o /tmp/solution_<timestamp>
docker exec oj-gcc sh -c "/tmp/solution_<timestamp> < /tmp/input_<timestamp>.txt"
```
 
**Constraints enforced per execution:**
- Time limit: 2 seconds (`{ timeout: 2000 }` in child_process)
- Filesystem: code runs inside container — cannot access host files or `.env`
- Timestamped filenames prevent collision between concurrent submissions
- `--restart unless-stopped` — container auto-recovers on crash or VM reboot
---
 
## 📅 Development Plan / Progress Log
 
| Day | Date | Task | Status |
|-----|------|------|--------|
| Day 1 | 26-05-2026 | Repo setup, README, project structure, `.gitignore`, `.env.example` | ✅ Done |
| Day 2 | 27-05-2026 | MongoDB schemas (Problem, Solution, TestCase, User) | ✅ Done |
| Day 3 | 28-05-2026 | Express server setup, MongoDB Atlas connection | ✅ Done |
| Day 4 | 28-05-2026 | Auth system — register, login, logout, JWT httpOnly cookie | ✅ Done |
| Day 5 | 29-05-2026 | Problem CRUD + TestCase routes with JWT protection | ✅ Done |
| Day 6 | 30-05-2026 | Submission pipeline + Leaderboard controller | ✅ Done |
| Day 7 | 30-06-2026 | Docker GCC container + full submission pipeline tested | ✅ Done |
| Day 8 | — | React frontend — routing, pages scaffold | 🔲 |
| Day 9 | — | Connect frontend to backend (problem list, problem page) | 🔲 |
| Day 10 | — | Submission UI + verdict display | 🔲 |
| Day 11 | — | Leaderboard page | 🔲 |
| Day 12 | — | Profile page + submission history | 🔲 |
| Day 13 | — | Testing, bug fixes, edge cases | 🔲 |
| Day 14 | — | Final cleanup, documentation, demo | 🔲 |
 
> This log is updated daily with actual progress and commits.
 
---
 
## ⚙️ Local Setup
 
```bash
# Prerequisites: Node.js, Docker Desktop, Git
 
# Clone the repo
git clone https://github.com/Mikey3600/Online-Judge.git
cd Online-Judge
 
# Backend
cd server
npm install
cp .env.example .env
# Fill MONGO_URI and JWT_SECRET in .env
 
# Start Docker container (one time)
docker run -d --name oj-gcc --restart unless-stopped gcc sleep infinity
 
# Start server
npm run dev
 
# Frontend (Day 8+)
cd ../client
npm install
npm start
```
 
---
 
## 🛡️ Security Considerations
 
- Passwords hashed with `bcrypt` (salt rounds: 10) — never stored in plaintext
- JWT tokens expire after `7d` — signed with server-only secret
- `httpOnly` cookies — JavaScript cannot access token (XSS safe)
- User enumeration attack prevented — identical error message for wrong email and wrong password
- Code execution fully isolated inside Docker container
- Protected routes verified via `verifyToken` middleware before any DB access
---
 
## 🚧 Known Gaps (Planned Improvements)
 
- [ ] Input validation with `express-validator` on all routes
- [ ] Role-based access control (admin vs user) for problem management
- [ ] Rate limiting on submission endpoint
- [ ] Bull + Redis async queue for production-scale concurrency
- [ ] Docker `--memory` and `--network none` flags for stricter sandboxing
- [ ] Pagination on leaderboard
---
 
## 📚 References
 
- [Docker GCC Image](https://hub.docker.com/_/gcc)
- [Docker Exec Docs](https://docs.docker.com/engine/reference/commandline/exec/)
- [isolate — IOI Sandbox](https://github.com/ioi/isolate)
- [Node child_process docs](https://nodejs.org/api/child_process.html)
- [Mongoose Docs](https://mongoosejs.com/docs/)
---
 
## 👤 Author
 
**Mayank** — CS Undergraduate, KIIT  
GitHub: [@Mikey3600](https://github.com/Mikey3600)
 
---
