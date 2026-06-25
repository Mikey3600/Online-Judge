<div align="center">

# ⚖️ Online Judge

**A full-stack competitive programming platform built with the MERN stack.**  
Ephemeral Docker sandboxing · JWT authentication · AI-powered hints · Automated C++17 judging

<br/>

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_AI-FF6B35?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PC9zdmc+&logoColor=white)
![AWS](https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

<br/>

![Demo](https://img.shields.io/badge/🌐_Live_Demo-13.232.12.240-4A90E2?style=for-the-badge)

</div>

---

## 📌 Overview

Online Judge is a production-grade competitive programming platform where users register, browse problems, submit C++ solutions, receive automated verdicts, and get **AI-powered hints** when they're stuck. The backend uses per-submission ephemeral Docker containers — every submission gets its own isolated workspace, network-disabled runtime, and automatic cleanup.

> 🤖 **What makes this different:** When you get a Wrong Answer or TLE, an AI assistant powered by **Groq + LLaMA 3.3** explains what went wrong in simple steps and lets you chat back and forth — without just giving you the answer.

---

## ✨ Features

| Area | Capability |
|---|---|
| 🔐 Authentication | Register, login, logout with bcrypt + JWT httpOnly cookies |
| 📋 Problems | Browse, search, and filter problems by difficulty |
| ⚡ Judging | C++17 compilation and execution in isolated ephemeral Docker containers |
| 🏆 Verdicts | `AC` `WA` `TLE` `RE` `CE` `SE` with color-coded display |
| 🤖 AI Hints | Groq-powered popup explains WA/TLE in simple steps |
| 💬 AI Chat | Follow-up conversation with AI assistant below the editor |
| 📊 Leaderboard | Ranked by accepted submissions with gold/silver/bronze top 3 |
| 👤 Profile | Submission history, verdict stats, acceptance rate |
| 🛡️ Security | httpOnly cookies, no-network Docker, CPU/memory/PID limits, read-only rootfs |

---

## 🤖 AI Assistant Flow

When a user gets **Wrong Answer** or **TLE**, this flow triggers:

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Express API
    participant G as Groq (LLaMA 3.3)

    U->>F: Submits C++ code
    F->>B: POST /api/submit
    B-->>F: verdict: WA / TLE
    F->>U: Popup appears — "Want to know why?"
    U->>F: Clicks "Yes, explain it"
    F->>B: POST /api/ai/hint
    B->>G: Problem + code + verdict context
    G-->>B: Step-by-step explanation
    B-->>F: hint text
    F->>U: Chat panel opens with AI explanation
    U->>F: Types follow-up question
    F->>B: POST /api/ai/chat (with history)
    B->>G: Full conversation context
    G-->>B: Contextual reply
    B-->>F: reply text
    F->>U: Chat continues
```

---

## 🏗️ Architecture

### Current

```mermaid
graph TD
    A[React Frontend<br/>Vite + Tailwind + Monaco] -->|HTTP + JWT Cookie| B[Express.js API]
    B --> C[(MongoDB Atlas<br/>users · problems<br/>solutions · test_cases)]
    B --> D[Docker Judge<br/>Ephemeral C++ Containers]
    B --> E[Groq API<br/>LLaMA 3.3 70B]
    D --> F[gcc:13 image<br/>g++ -std=c++17 -O2<br/>2s timeout · --rm cleanup]

    style A fill:#20232A,color:#61DAFB,stroke:#61DAFB
    style B fill:#000,color:#fff,stroke:#444
    style C fill:#47A248,color:#fff,stroke:#2d6a2d
    style D fill:#2496ED,color:#fff,stroke:#1a6fa8
    style E fill:#FF6B35,color:#fff,stroke:#cc4400
    style F fill:#1a1a2e,color:#fff,stroke:#2496ED
```

### Production Target (Planned)

```mermaid
graph TD
    A[React Frontend] --> B[Express API]
    B -->|enqueue| C[Redis Queue<br/>BullMQ]
    C -->|jobs| D[Judge Workers]
    D -->|create/run/destroy| E[Ephemeral Containers<br/>C++ · Python · Java]
    B -.->|WebSocket| A

    style A fill:#20232A,color:#61DAFB,stroke:#61DAFB
    style B fill:#000,color:#fff,stroke:#444
    style C fill:#DC382D,color:#fff,stroke:#a02020
    style D fill:#FF9900,color:#000,stroke:#cc7700
    style E fill:#2496ED,color:#fff,stroke:#1a6fa8
```

---

## 🔄 Submission Pipeline

```mermaid
flowchart TD
    A([User submits C++ code]) --> B[POST /api/submit]
    B --> C{verifyToken}
    C -->|invalid| X1[401 Unauthorized]
    C -->|valid| D[Problem.findById]
    D -->|not found| X2[404 Not Found]
    D -->|found| E[TestCase.find]
    E -->|empty| X3[400 No test cases]
    E -->|has cases| F[For each test case]

    F --> G[mkdtemp → unique workdir]
    G --> H[Write source.cpp + input.txt]
    H --> I[docker run --rm --network none<br/>--memory 128m --cpus 1 --pids-limit 64<br/>--read-only --cap-drop ALL]
    I --> J[g++ -std=c++17 -O2 compile]
    J -->|exit 100| CE[🟠 CE — Compilation Error]
    J -->|ok| K[timeout 2s ./solution]
    K -->|exit 124/137| TLE[🟡 TLE — Time Limit Exceeded]
    K -->|non-zero| RE[🔴 RE — Runtime Error]
    K -->|ok| L[normalizeOutput comparison]
    L -->|mismatch| WA[🔴 WA — Wrong Answer]
    L -->|match| M{More test cases?}
    M -->|yes| F
    M -->|no| AC[🟢 AC — Accepted]

    AC --> N[Solution.create · return verdict]
    CE --> N
    TLE --> N
    RE --> N
    WA --> N

    style AC fill:#166534,color:#fff,stroke:#15803d
    style WA fill:#7f1d1d,color:#fff,stroke:#991b1b
    style TLE fill:#713f12,color:#fff,stroke:#92400e
    style RE fill:#4a044e,color:#fff,stroke:#6b21a8
    style CE fill:#431407,color:#fff,stroke:#c2410c
    style X1 fill:#1f2937,color:#9ca3af,stroke:#374151
    style X2 fill:#1f2937,color:#9ca3af,stroke:#374151
    style X3 fill:#1f2937,color:#9ca3af,stroke:#374151
```

---

## 🐳 Docker Isolation Model

### ❌ Old: Shared Persistent Container

```
Submission A ─┐
Submission B ─┼──► oj-gcc (shared forever) ── shared /tmp, shared process space
Submission C ─┘
```

### ✅ New: Per-Submission Ephemeral Containers

```
Submission A ──► Container A (uuid) ──► auto removed ✓
Submission B ──► Container B (uuid) ──► auto removed ✓
Submission C ──► Container C (uuid) ──► auto removed ✓
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
| `--tmpfs /tmp` | Writable scratch space for compiler |
| `--security-opt no-new-privileges` | No privilege escalation |
| `--cap-drop ALL` | Drop all Linux capabilities |
| bind mount `/judge` only | Container sees only submission workspace |

---

## 🔐 Auth Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Express API
    participant D as MongoDB

    C->>A: POST /auth/register { fullName, email, password, dob }
    A->>D: User.findOne({ email })
    D-->>A: null (not duplicate)
    A->>A: bcrypt.hash(password, 10)
    A->>D: User.create(...)
    A->>A: jwt.sign({ userId }, JWT_SECRET, 7d)
    A-->>C: Set-Cookie: token=JWT (httpOnly, sameSite: lax)

    C->>A: POST /auth/login { email, password }
    A->>D: User.findOne({ email })
    A->>A: bcrypt.compare(password, hash)
    A-->>C: Set-Cookie: token=JWT

    C->>A: GET /api/profile (cookie auto-sent)
    A->>A: verifyToken → jwt.verify
    A-->>C: 200 profile data
```

> **Why httpOnly cookies over localStorage?** `localStorage` is readable by any JS — XSS steals the token instantly. `httpOnly` cookies are invisible to JavaScript. Browsers send them automatically, attackers cannot read them.

---

## 🗃️ Database Schema

```mermaid
erDiagram
    USERS {
        ObjectId _id PK
        String fullName
        String email
        String password
        Date dob
    }
    PROBLEMS {
        ObjectId _id PK
        String name
        String statement
        String code
        String difficulty
    }
    TEST_CASES {
        ObjectId _id PK
        String input
        String output
        ObjectId problem FK
    }
    SOLUTIONS {
        ObjectId _id PK
        ObjectId problem FK
        ObjectId user FK
        String verdict
        Date submitted_at
    }

    USERS ||--o{ SOLUTIONS : "submits"
    PROBLEMS ||--o{ SOLUTIONS : "has"
    PROBLEMS ||--o{ TEST_CASES : "has"
```

---

## 🔌 API Reference

> Base URL: `http://localhost:5000/api`  
> Protected endpoints require the `token` httpOnly cookie set by `/auth/login`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Register new user |
| `POST` | `/auth/login` | No | Login, sets JWT cookie |
| `POST` | `/auth/logout` | No | Clears JWT cookie |
| `GET` | `/problems` | No | List all problems |
| `GET` | `/problems/:id` | No | Get problem by ID |
| `POST` | `/problems` | ✓ | Create problem |
| `PUT` | `/problems/:id` | ✓ | Update problem |
| `DELETE` | `/problems/:id` | ✓ | Delete problem |
| `POST` | `/testcases` | ✓ | Add test case |
| `GET` | `/testcases/:problemId` | No | Get test cases for problem |
| `DELETE` | `/testcases/:id` | ✓ | Delete test case |
| `POST` | `/submit` | ✓ | Submit code for judging |
| `POST` | `/ai/hint` | ✓ | Get AI hint for WA/TLE |
| `POST` | `/ai/chat` | ✓ | Continue AI conversation |
| `GET` | `/leaderboard` | No | Get leaderboard |
| `GET` | `/profile` | ✓ | Get user profile + stats |

---

## 📁 Repository Structure

```
Online-Judge/
├── client/                          # React + Vite frontend
│   └── src/
│       ├── pages/
│       │   ├── Home.jsx             # Problems table with search + filter
│       │   ├── Problem.jsx          # Split editor + AI chat panel
│       │   ├── Leaderboard.jsx      # Ranked table with medal colors
│       │   ├── Profile.jsx          # Stats cards + submission history
│       │   ├── Login.jsx
│       │   └── Register.jsx
│       └── components/
│           └── Navbar.jsx
├── docker/
│   └── Dockerfile.gcc               # GCC judge image definition
├── server/
│   ├── controllers/
│   │   ├── aiController.js          # Groq hint + chat handlers
│   │   ├── authController.js
│   │   ├── problemController.js
│   │   ├── submissionController.js
│   │   ├── leaderboardController.js
│   │   ├── testCaseController.js
│   │   └── profileController.js
│   ├── executors/
│   │   ├── docker/dockerCommand.js  # spawn wrapper for Docker CLI
│   │   ├── utils/output.js          # Output normalization
│   │   └── runCode.js               # Ephemeral container execution engine
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Problem.js
│   │   ├── Solution.js
│   │   └── TestCase.js
│   ├── routes/
│   │   ├── ai.js                    # /api/ai/hint · /api/ai/chat
│   │   ├── auth.js
│   │   ├── problems.js
│   │   ├── submit.js
│   │   ├── leaderboard.js
│   │   ├── testCases.js
│   │   └── profile.js
│   └── index.js
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
- Groq API key — [get one free at console.groq.com](https://console.groq.com)

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
CLIENT_ORIGIN=http://localhost:5173
JUDGE_DOCKER_IMAGE=gcc:13
JUDGE_DOCKER_TIMEOUT_MS=20000
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Install and run backend

```bash
npm install
npm run dev
```

### 4. Pull judge image

```bash
docker pull gcc:13
```

### 5. Install and run frontend

```bash
cd ../client
npm install
npm run dev
```

Frontend at `http://localhost:5173` · API at `http://localhost:5000`

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

---

## 🚀 Future Scope

- **Redis + BullMQ** — async submission queue for production scale
- **WebSockets** — stream live verdict updates instead of polling
- **Contest Mode** — timed competitions with scoreboards and freeze windows
- **Rating System** — Codeforces-style rating progression
- **Multi-language** — Python, Java, JavaScript with per-language limits
- **Plagiarism Detection** — MOSS integration for similarity checks
- **Kubernetes** — horizontally scalable judge worker nodes

---

## 📚 References

- [Docker GCC Image](https://hub.docker.com/_/gcc)
- [Docker Security — Cap Drop](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities)
- [Groq API Docs](https://console.groq.com/docs)
- [isolate — IOI Sandbox](https://github.com/ioi/isolate)
- [BullMQ](https://docs.bullmq.io/)
- [Mongoose Docs](https://mongoosejs.com/docs/)

---

## 📄 License

MIT © [Mayank](https://github.com/Mikey3600)

---

<div align="center">
  <strong>Built by Mayank — CS Undergraduate, KIIT</strong><br/>
  <a href="https://github.com/Mikey3600">@Mikey3600</a>
</div>
