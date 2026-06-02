const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const index = read('index.js');
const routeMounts = [
    ['authRoutes', '/api/auth', 'routes/auth.js'],
    ['problemRoutes', '/api/problems', 'routes/problems.js'],
    ['testCaseRoutes', '/api/testcases', 'routes/testCases.js'],
    ['solutionRoutes', '/api/solutions', 'routes/solutions.js'],
    ['submitRoutes', '/api/submit', 'routes/submit.js'],
    ['leaderboardRoutes', '/api/leaderboard', 'routes/leaderboard.js'],
    ['profileRoutes', '/api/profile', 'routes/profile.js']
];

for (const [variableName, mountPath, routeFile] of routeMounts) {
    assert.ok(index.includes(`const ${variableName} = require('./${routeFile.replace('.js', '')}')`), `${variableName} is not imported`);
    assert.ok(index.includes(`app.use('${mountPath}', ${variableName})`), `${mountPath} is not mounted`);
}

const routeControllerMap = {
    'routes/auth.js': ['register', 'login', 'logout'],
    'routes/problems.js': ['getAllProblems', 'getProblemById', 'createProblem', 'updateProblem', 'deleteProblem'],
    'routes/testCases.js': ['addTestCase', 'getTestCases', 'updateTestCase', 'deleteTestCase'],
    'routes/solutions.js': ['submitCode'],
    'routes/submit.js': ['submitCode'],
    'routes/leaderboard.js': ['getLeaderboard'],
    'routes/profile.js': ['getProfile']
};

for (const [routeFile, controllers] of Object.entries(routeControllerMap)) {
    const routeSource = read(routeFile);
    for (const controllerName of controllers) {
        assert.ok(routeSource.includes(controllerName), `${controllerName} is not referenced by ${routeFile}`);
    }
}

const controllerExports = {
    'controllers/authController.js': ['register', 'login', 'logout'],
    'controllers/problemController.js': ['getAllProblems', 'getProblemById', 'createProblem', 'updateProblem', 'deleteProblem'],
    'controllers/testCaseController.js': ['addTestCase', 'getTestCases', 'updateTestCase', 'deleteTestCase'],
    'controllers/submissionController.js': ['submitCode', 'judgeSubmission'],
    'controllers/leaderboardController.js': ['getLeaderboard'],
    'controllers/profileController.js': ['getProfile']
};

for (const [controllerFile, exports] of Object.entries(controllerExports)) {
    const source = read(controllerFile);
    for (const exportedName of exports) {
        assert.ok(source.includes(exportedName), `${exportedName} is missing from ${controllerFile}`);
    }
}

const docs = read('docs/api-audit.md');
const endpoints = [
    'GET /',
    'GET /api/health',
    'POST /api/auth/register',
    'POST /api/auth/login',
    'POST /api/auth/logout',
    'GET /api/problems',
    'GET /api/problems/:id',
    'POST /api/problems',
    'PUT /api/problems/:id',
    'DELETE /api/problems/:id',
    'POST /api/testcases',
    'GET /api/testcases/:problemId',
    'PUT /api/testcases/:id',
    'DELETE /api/testcases/:id',
    'POST /api/submit',
    'POST /api/solutions/submit',
    'GET /api/leaderboard',
    'GET /api/profile'
];

for (const endpoint of endpoints) {
    assert.ok(docs.includes(endpoint), `endpoint ${endpoint} missing from audit docs`);
}

JSON.parse(read('docs/postman_collection.json'));

console.log(`Static backend audit passed for ${endpoints.length} endpoints.`);
