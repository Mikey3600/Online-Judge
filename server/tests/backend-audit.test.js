const assert = require('assert');
const { extractBearerToken } = require('../middleware/auth');
const { normalizeOutput } = require('../executors/utils/output');
const { buildDockerRunArgs } = require('../executors/runCode');
const { VERDICTS } = require('../constants/verdicts');

const args = buildDockerRunArgs('oj-test', '/tmp/oj-test', 'gcc:13');

assert.strictEqual(extractBearerToken('Bearer abc.def.ghi'), 'abc.def.ghi');
assert.strictEqual(extractBearerToken('Basic abc'), null);
assert.strictEqual(normalizeOutput('1  \r\n2\n\n'), '1\n2');

for (const verdict of ['AC', 'WA', 'CE', 'RE', 'TLE']) {
    assert.ok(Object.values(VERDICTS).includes(verdict), `missing verdict ${verdict}`);
}

for (const requiredArg of ['--rm', '--network', 'none', '--memory', '128m', '--cpus', '1', '--pids-limit', '64', '--user', '65534:65534', '--read-only', '--security-opt', 'no-new-privileges', '--cap-drop', 'ALL']) {
    assert.ok(args.includes(requiredArg), `missing docker isolation arg ${requiredArg}`);
}

assert.ok(args.some((arg) => arg.startsWith('type=bind,source=/tmp/oj-test,target=/judge')), 'missing bind mount');
assert.ok(args.includes('--tmpfs'), 'missing tmpfs flag');
assert.ok(args[args.length - 1].includes('g++ -std=c++17'), 'missing C++17 compilation command');
assert.ok(args[args.length - 1].includes('timeout --kill-after=1s 2s ./solution < input.txt'), 'missing execution timeout command');

console.log('backend audit unit checks passed');
