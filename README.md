#  True Judge
 
> A full-stack competitive programming platform — built from scratch using the MERN stack with Docker-sandboxed code execution, JWT authentication, and an async submission pipeline.
 
---
 
##  Project Overview
 
An True Judge (OJ) is a platform that hosts coding competitions where participants submit solutions that are automatically evaluated against hidden test cases. This project replicates core features of platforms like Codeforces and Codechef .
 
The system handles real-world engineering challenges:
- **Thundering Herd** — thousands of simultaneous submissions handled via async message queue
- **Malicious Code** — sandboxed inside Docker containers with memory and time limits
- **Verdict Integrity** — protected via JWT-based auth and role-based access control
---
 
##  Tech Stack
 
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
 
##  Features
 
-  User Registration and Login with JWT-based session management
-  Problem listing with difficulty tags
-  Individual problem view with an in-browser code editor
-  Code submission with real-time verdict (Accepted / Wrong Answer / TLE / Runtime Error)
-  Docker-sandboxed execution — memory-limited, time-limited, isolated
-  Leaderboard showing last 10 submissions with verdicts
-   User profile with submission history
---
 
##  Project Structure
 
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
│   │   └── leaderboard.js
│   ├── controllers/          # Business logic
│   │   ├── authController.js
│   │   ├── problemController.js
│   │   └── submissionController.js
│   ├── middleware/            # JWT verification, error handling
│   ├── executors/            # Docker execution logic
│   │   └── runCode.js        # child_process + docker exec
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
 
##  Database Design
 
### Collection 1 — `problems`
```
{
  name: String,
  statement: String,
  code: String,           
  difficulty: String      
}
```
 
### Collection 2 — `solutions`
```
{
  problem: ObjectId,      
  user: ObjectId,         
  verdict: String,        
  submitted_at: Date      
}
```
 
### Collection 3 — `test_cases`
```
{
  input: String,
  output: String,
  problem: ObjectId       
}
```
 
### Collection 4 — `users`
```
{
  fullName: String,
  email: String,
  password: String,       // bcrypt hashed
  dob: Date
}
```
 
---
 
## 🔄 System Architecture
 
```
User submits code
      │
      ▼
Express POST /submit
      │
      ├─ Fetch test cases from MongoDB
      │
      ├─ Write code to temp file
      │
      ├─ docker exec → GCC container compiles + runs
      │
      ├─ Compare output vs expected output
      │
      ├─ Save verdict to solutions collection
      │
      └─ Return verdict to frontend
```
 
For high concurrency → submissions go into an **async message queue**, processed one by one by the executor service.
 
---
 
##  Auth Flow
 
```
Register → POST /api/auth/register → bcrypt hash password → save user → return JWT
Login    → POST /api/auth/login    → verify password → return JWT
Protected routes → middleware reads JWT from Authorization header → attach user to req
```
 
---
 
##  Docker Execution
 
```bash
# Container setup
docker run --name oj-gcc -d gcc
 
# Execution (called from Node child_process)
docker exec oj-gcc gcc /code/solution.cpp -o /code/solution
docker exec oj-gcc /code/solution < /code/input.txt
```
 
Constraints enforced per container:
- Memory limit: configurable (default 256MB)
- Time limit: enforced via execution timeout in `child_process`
- No network access inside container
- No access to host filesystem beyond mounted code directory
---
 
##  Development Plan / Progress Log
 
| Day | Date | Task | Status |
|-----|------|------|--------|
| Day 1 | — | Repo setup, README, project structure, `.gitignore`, `.env.example` |  Done |
| Day 2 | — | MongoDB schemas (Problem, Solution, TestCase, User) |  |
| Day 3 | — | Express server setup, basic routes, Mongoose connection |  |
| Day 4 | — | Auth system — register, login, JWT middleware |  |
| Day 5 | — | Problem CRUD routes + controllers |  |
| Day 6 | — | Code submission route + child_process local execution |  |
| Day 7 | — | Docker container setup + integrate with submission pipeline |  |
| Day 8 | — | React frontend — routing, pages scaffold |  |
| Day 9 | — | Connect frontend to backend (problem list, problem page) |  |
| Day 10 | — | Submission UI + verdict display |  |
| Day 11 | — | Leaderboard page |  |
| Day 12 | — | Profile page + submission history |  |
| Day 13 | — | Testing, bug fixes, edge cases |  |
| Day 14 | — | Final cleanup, documentation, demo |  |
 
> This log is updated daily with actual progress, code pushed, and blockers faced.
 
---
 
##  Local Setup (Coming Soon)
 
```bash
# Clone the repo
git clone https://github.com/Mikey3600/Online-Judge.git
cd Online-Judge
 
# Backend
cd server
npm install
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env
node index.js
 
# Frontend
cd ../client
npm install
npm start
```
 
---
 
##  Security Considerations
 
- Passwords hashed with `bcrypt` before storing
- JWT tokens expire after 24h
- Code execution fully isolated inside Docker
- No user code ever touches the host filesystem directly
- Protected routes verified via middleware before any DB access
---
 
##  References
 
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
 
