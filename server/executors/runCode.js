const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { randomUUID } = require('crypto');
const { runDockerCommand } = require('./docker/dockerCommand');
const { VERDICTS } = require('../constants/verdicts');

const DEFAULT_IMAGE = 'gcc:13';
const EXECUTION_TIMEOUT_SECONDS = 2;
const DOCKER_TIMEOUT_MS = 20000;

const buildDockerRunArgs = (containerName, workDir, image) => [
    'run',
    '--rm',
    '--name', containerName,
    '--network', 'none',
    '--memory', '128m',
    '--cpus', '1',
    '--pids-limit', '64',
    '--user', '65534:65534',
    '--read-only',
    '--tmpfs', '/tmp:rw,nosuid,nodev,size=16m',
    '--security-opt', 'no-new-privileges',
    '--cap-drop', 'ALL',
    '--mount', `type=bind,source=${workDir},target=/judge,readonly=false`,
    '--workdir', '/judge',
    image,
    'sh',
    '-lc',
    [
        'set -u',
        'export TMPDIR=/tmp',
        'g++ -std=c++17 -O2 -pipe source.cpp -o solution 2> compile.stderr',
        'compile_status=$?',
        'if [ "$compile_status" -ne 0 ]; then cat compile.stderr >&2; exit 100; fi',
        `timeout --kill-after=1s ${EXECUTION_TIMEOUT_SECONDS}s ./solution < input.txt`
    ].join('\n')
];

const removeContainer = async (containerName) => {
    await runDockerCommand(['rm', '-f', containerName], { timeoutMs: 5000 });
};

const runCode = async (code, input = '') => {
    const submissionId = randomUUID();
    const workDir = await fs.mkdtemp(path.join(os.tmpdir(), `oj-${Date.now()}-${submissionId}-`));
    const containerName = `oj-run-${submissionId}`;
    const image = process.env.JUDGE_DOCKER_IMAGE || DEFAULT_IMAGE;
    const dockerTimeoutMs = Number(process.env.JUDGE_DOCKER_TIMEOUT_MS || DOCKER_TIMEOUT_MS);

    try {
        await fs.chmod(workDir, 0o777);
        await fs.writeFile(path.join(workDir, 'source.cpp'), code, 'utf8');
        await fs.writeFile(path.join(workDir, 'input.txt'), input, 'utf8');

        const result = await runDockerCommand(
            buildDockerRunArgs(containerName, workDir, image),
            { timeoutMs: dockerTimeoutMs }
        );

        if (result.timedOut) {
            return {
                verdict: VERDICTS.TIME_LIMIT_EXCEEDED,
                output: result.stdout,
                error: 'Execution exceeded the host-side Docker timeout.'
            };
        }

        if (result.code === 100) {
            return {
                verdict: VERDICTS.COMPILATION_ERROR,
                output: '',
                error: result.stderr.trim()
            };
        }

        if (result.code === 124 || result.code === 137) {
            return {
                verdict: VERDICTS.TIME_LIMIT_EXCEEDED,
                output: result.stdout,
                error: result.stderr.trim()
            };
        }

        if (result.code !== 0) {
            return {
                verdict: VERDICTS.RUNTIME_ERROR,
                output: result.stdout,
                error: result.stderr.trim()
            };
        }

        return {
            verdict: VERDICTS.ACCEPTED,
            output: result.stdout,
            error: result.stderr.trim()
        };
    } catch (error) {
        return {
            verdict: VERDICTS.SYSTEM_ERROR,
            output: '',
            error: error.message
        };
    } finally {
        await removeContainer(containerName);
        await fs.rm(workDir, { recursive: true, force: true });
    }
};

module.exports = runCode;
module.exports.buildDockerRunArgs = buildDockerRunArgs;
module.exports.removeContainer = removeContainer;
