const { spawn } = require('child_process');

const runDockerCommand = (args, options = {}) => {
    const { timeoutMs = 15000 } = options;

    return new Promise((resolve) => {
        const child = spawn('docker', args, {
            stdio: ['ignore', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';
        let timedOut = false;

        const timer = setTimeout(() => {
            timedOut = true;
            child.kill('SIGKILL');
        }, timeoutMs);

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('error', (error) => {
            clearTimeout(timer);
            resolve({ code: null, stdout, stderr: error.message, timedOut });
        });

        child.on('close', (code) => {
            clearTimeout(timer);
            resolve({ code, stdout, stderr, timedOut });
        });
    });
};

module.exports = { runDockerCommand };
