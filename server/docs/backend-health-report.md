# Backend Health Report

## Overall Status

Backend audit status: **Passing static and unit audit checks**.

Runtime note: Docker is required to execute real judge submissions. The current audit environment does not have the Docker CLI installed, so Docker verdict execution was validated structurally through the executor arguments and cleanup flow rather than by launching containers.

## Route Registration

All route modules imported by the server are mounted:

- `authRoutes` -> `/api/auth`
- `problemRoutes` -> `/api/problems`
- `testCaseRoutes` -> `/api/testcases`
- `solutionRoutes` -> `/api/solutions`
- `submitRoutes` -> `/api/submit`
- `leaderboardRoutes` -> `/api/leaderboard`
- `profileRoutes` -> `/api/profile`

## Controller Coverage

Every mounted route references an exported controller function. No mounted route points to a missing controller.

## Middleware Coverage

Protected endpoints use `verifyToken`:

- `POST /api/problems`
- `PUT /api/problems/:id`
- `DELETE /api/problems/:id`
- `POST /api/testcases`
- `PUT /api/testcases/:id`
- `DELETE /api/testcases/:id`
- `POST /api/submit`
- `POST /api/solutions/submit`
- `GET /api/profile`

`verifyToken` reads the JWT from an httpOnly cookie first and then from a Bearer token for API tooling.

## Authentication and JWT

- Passwords are hashed with bcrypt before storage.
- Emails are normalized to lowercase.
- JWT creation fails explicitly if `JWT_SECRET` is not configured.
- Invalid, expired, or malformed tokens return a consistent `401` response.

## Cookie Handling

- Auth cookie is httpOnly.
- Cookie `secure` and `sameSite` settings are environment-aware.
- Logout clears the cookie using matching cookie options.

## MongoDB Safety

- ObjectId route parameters are validated before Mongoose queries.
- Update endpoints run schema validators.
- Duplicate problem codes are checked on create and update.
- Deleting a problem removes its related test cases.

## Judge Health

- Each test run creates a unique temporary directory and container name.
- Docker networking is disabled with `--network none`.
- Memory, CPU, and PID limits are configured.
- Container runs as user `65534:65534` with dropped capabilities and no-new-privileges.
- Root filesystem is read-only and `/tmp` is a constrained tmpfs.
- Containers are removed with `docker rm -f` in `finally` cleanup.
- Temporary directories are removed in `finally` cleanup.

## Verdict Coverage

- `AC`: returned only when every test case output matches.
- `WA`: returned when program output differs from expected output.
- `CE`: returned for compiler failures.
- `RE`: returned for non-timeout nonzero runtime exits.
- `TLE`: returned for GNU `timeout` exits or host-side Docker timeout.
