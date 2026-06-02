# Backend API Audit

Base URL: `http://localhost:5000`

## API Audit Table

| Endpoint | Status | Issue | Fix |
|---|---|---|---|
| `GET /` | Pass | Root route returned only a legacy shape. | Standardized success response with `success`, `message`, and optional `data`. |
| `GET /api/health` | Added | No backend health endpoint existed. | Added a lightweight health endpoint with service name and timestamp. |
| `POST /api/auth/register` | Fixed | Missing request validation, inconsistent error status for duplicates, hard-coded insecure cookie options, and no JWT secret guard. | Added required-field/password validation, 409 duplicate handling, normalized emails, environment-aware cookie flags, and JWT secret validation. |
| `POST /api/auth/login` | Fixed | Missing request validation and inconsistent invalid-credential status. | Added required-field validation, normalized emails, and consistent 401 invalid credentials response. |
| `POST /api/auth/logout` | Fixed | Clear-cookie options did not match set-cookie options. | Added shared cookie option helpers for setting and clearing auth cookies. |
| `GET /api/problems` | Fixed | Response format was a raw array and sorting was unspecified. | Standardized response shape and sorted by problem code. |
| `GET /api/problems/:id` | Fixed | Invalid Mongo ObjectIds produced server errors. | Added ObjectId validation before database lookup. |
| `POST /api/problems` | Fixed | Missing validation, duplicate code status was 400, update validators were not enforced, and codes were not normalized. | Added required-field/difficulty validation, code normalization, and 409 duplicates. |
| `PUT /api/problems/:id` | Fixed | Invalid ObjectIds and empty update bodies were not handled; duplicate code conflicts were not checked; Mongoose validators were not enabled. | Added ObjectId validation, allow-listed payloads, duplicate checks, and `runValidators`. |
| `DELETE /api/problems/:id` | Fixed | Invalid ObjectIds produced server errors and orphan test cases could remain. | Added ObjectId validation and deletes related test cases on problem deletion. |
| `POST /api/testcases` | Fixed | Did not validate required fields, problem existence, or ObjectId format. | Added validation and problem lookup before creating test cases. |
| `GET /api/testcases/:problemId` | Fixed | Did not validate problem id or problem existence; response format was a raw array. | Added ObjectId validation, problem existence check, deterministic sort, and standard response shape. |
| `PUT /api/testcases/:id` | Added | TestCase CRUD was incomplete because update was missing. | Added authenticated update endpoint with validation and problem existence checks. |
| `DELETE /api/testcases/:id` | Fixed | Did not validate ObjectId and returned success for missing records. | Added ObjectId validation and 404 when the test case does not exist. |
| `POST /api/submit` | Fixed | Missing ObjectId validation, weak code validation, and raw response shape. | Added request validation, problem/testcase lookups, standard response shape, and failed-test metadata. |
| `POST /api/solutions/submit` | Fixed | Alias was mounted, but shared the same controller issues as `/api/submit`. | Kept the compatibility route and fixed the shared submission controller. |
| `GET /api/leaderboard` | Fixed | It returned the last 10 submissions, not leaderboard rankings. | Replaced with an accepted-submission aggregation sorted by solved count, accepted count, and earliest latest accepted time. |
| `GET /api/profile` | Fixed | Did not validate token user id and response format was inconsistent. | Added token payload ObjectId validation, standardized response, and submission stats. |

## Complete Endpoint List

| Method | Path | Auth | Controller | Request Body | Success Response |
|---|---|---|---|---|---|
| GET | `/` | No | inline health/root handler | none | `{ success, message }` |
| GET | `/api/health` | No | inline health handler | none | `{ success, message, data: { service, timestamp } }` |
| POST | `/api/auth/register` | No | `register` | `{ fullName, email, password, dob? }` | `{ success, message, data: { user } }` |
| POST | `/api/auth/login` | No | `login` | `{ email, password }` | `{ success, message, data: { user } }` |
| POST | `/api/auth/logout` | No | `logout` | none | `{ success, message }` |
| GET | `/api/problems` | No | `getAllProblems` | none | `{ success, message, data: { problems } }` |
| GET | `/api/problems/:id` | No | `getProblemById` | none | `{ success, message, data: { problem } }` |
| POST | `/api/problems` | Yes | `createProblem` | `{ name, statement, code, difficulty? }` | `{ success, message, data: { problem } }` |
| PUT | `/api/problems/:id` | Yes | `updateProblem` | any of `{ name, statement, code, difficulty }` | `{ success, message, data: { problem } }` |
| DELETE | `/api/problems/:id` | Yes | `deleteProblem` | none | `{ success, message }` |
| POST | `/api/testcases` | Yes | `addTestCase` | `{ problem or problemId, input, output }` | `{ success, message, data: { testCase } }` |
| GET | `/api/testcases/:problemId` | No | `getTestCases` | none | `{ success, message, data: { testCases } }` |
| PUT | `/api/testcases/:id` | Yes | `updateTestCase` | any of `{ problem or problemId, input, output }` | `{ success, message, data: { testCase } }` |
| DELETE | `/api/testcases/:id` | Yes | `deleteTestCase` | none | `{ success, message }` |
| POST | `/api/submit` | Yes | `submitCode` | `{ problemId, code }` | `{ success, message, data: { verdict, verdictLabel, solutionId, failedTestCase, error? } }` |
| POST | `/api/solutions/submit` | Yes | `submitCode` | `{ problemId, code }` | same as `/api/submit` |
| GET | `/api/leaderboard` | No | `getLeaderboard` | none | `{ success, message, data: { leaderboard } }` |
| GET | `/api/profile` | Yes | `getProfile` | none | `{ success, message, data: { user, recentSubmissions, stats } }` |

## Judge System Audit

| Area | Status | Notes |
|---|---|---|
| Problem lookup | Pass | Submission validates ObjectId and checks `Problem.findById` before judging. |
| Test case lookup | Pass | Submission loads deterministic `_id`-sorted test cases and rejects problems with no tests. |
| Compilation | Pass | Docker command compiles with `g++ -std=c++17` and maps compile failure to `CE`. |
| Execution | Pass | Uses per-run temp directory and feeds `input.txt` to the compiled binary. |
| Verdict generation | Pass | `AC` is returned only after all test cases match; output mismatch maps to `WA`; compile/runtime/timeout conditions map to `CE`, `RE`, and `TLE`. |
| Docker execution | Pass | Docker is invoked per test run with network disabled, memory/CPU/PID limits, read-only root filesystem, dropped capabilities, no-new-privileges, tmpfs `/tmp`, and non-root user. |
| Cleanup | Pass | Executor always attempts `docker rm -f <container>` and removes the temporary directory in a `finally` block. |

## Backend Health Report

- Route registration: all imported route modules are mounted in `server/index.js`.
- Controllers: all mounted routes reference exported controller functions.
- Middleware: protected routes use `verifyToken`; auth supports httpOnly cookie tokens and Bearer tokens for API tooling.
- Models: controller field references now match model fields (`Problem.name/statement/code/difficulty`, `TestCase.input/output/problem`, `Solution.problem/user/verdict/submitted_at`, `User.fullName/email/password/dob`).
- Authentication flow: register/login hash and verify passwords, create JWTs, and set httpOnly cookies; logout clears the cookie.
- JWT handling: missing/invalid/expired tokens and malformed token payloads produce consistent errors.
- Cookie handling: cookie security is environment-aware and clear options match set options.
- MongoDB queries: ObjectId inputs are validated before lookups; update validators are enabled; problem deletion removes orphan test cases.
- Docker integration: judge uses ephemeral, isolated Docker runs and cleanup logic.
- Error handling: consistent response envelope and global JSON/404/error handlers are present.

## Fix List

1. Added shared response helpers.
2. Added shared validation helpers.
3. Added environment-aware cookie helpers.
4. Hardened auth registration, login, logout, and token extraction.
5. Added Bearer token support for API tests while preserving cookie auth.
6. Added root and `/api/health` standard responses.
7. Added global 404 and JSON/error handlers.
8. Added ObjectId validation across problem, testcase, submission, and profile paths.
9. Added request validation across auth, problem, testcase, and submission endpoints.
10. Added TestCase update endpoint to complete CRUD.
11. Added problem existence checks for testcase operations.
12. Added duplicate problem-code checks on create and update.
13. Enabled validators for updates.
14. Added cascade cleanup for test cases when a problem is deleted.
15. Replaced recent-submission leaderboard with accepted-submission rankings.
16. Added profile submission stats.
17. Hardened Docker execution by adding a non-root user flag.
18. Exported Docker arg builder for audit verification.
