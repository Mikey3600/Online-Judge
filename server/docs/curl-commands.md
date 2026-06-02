# Curl Commands for Every Backend Endpoint

Set these variables first:

```bash
BASE_URL=http://localhost:5000
TOKEN_COOKIE="token=<paste-cookie-token>"
PROBLEM_ID=<problem-id>
TESTCASE_ID=<testcase-id>
```

## Root and Health

```bash
curl -i "$BASE_URL/"
```

```bash
curl -i "$BASE_URL/api/health"
```

## Authentication

```bash
curl -i -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"fullName":"Ada Lovelace","email":"ada@example.com","password":"secret123","dob":"1815-12-10"}'
```

```bash
curl -i -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"ada@example.com","password":"secret123"}'
```

```bash
curl -i -X POST "$BASE_URL/api/auth/logout" \
  -b cookies.txt
```

## Problems

```bash
curl -i "$BASE_URL/api/problems"
```

```bash
curl -i "$BASE_URL/api/problems/$PROBLEM_ID"
```

```bash
curl -i -X POST "$BASE_URL/api/problems" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"A + B","statement":"Read two integers and print their sum.","code":"A_PLUS_B","difficulty":"Easy"}'
```

```bash
curl -i -X PUT "$BASE_URL/api/problems/$PROBLEM_ID" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"difficulty":"Medium"}'
```

```bash
curl -i -X DELETE "$BASE_URL/api/problems/$PROBLEM_ID" \
  -b cookies.txt
```

## Test Cases

```bash
curl -i -X POST "$BASE_URL/api/testcases" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"problemId":"'"$PROBLEM_ID"'","input":"1 2\n","output":"3\n"}'
```

```bash
curl -i "$BASE_URL/api/testcases/$PROBLEM_ID"
```

```bash
curl -i -X PUT "$BASE_URL/api/testcases/$TESTCASE_ID" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"input":"2 2\n","output":"4\n"}'
```

```bash
curl -i -X DELETE "$BASE_URL/api/testcases/$TESTCASE_ID" \
  -b cookies.txt
```

## Submission

```bash
curl -i -X POST "$BASE_URL/api/submit" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"problemId":"'"$PROBLEM_ID"'","code":"#include <bits/stdc++.h>\nusing namespace std;\nint main(){ long long a,b; cin>>a>>b; cout<<a+b<<'\\n'; }"}'
```

```bash
curl -i -X POST "$BASE_URL/api/solutions/submit" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"problemId":"'"$PROBLEM_ID"'","code":"#include <bits/stdc++.h>\nusing namespace std;\nint main(){ long long a,b; cin>>a>>b; cout<<a+b<<'\\n'; }"}'
```

## Leaderboard and Profile

```bash
curl -i "$BASE_URL/api/leaderboard"
```

```bash
curl -i "$BASE_URL/api/profile" \
  -b cookies.txt
```
