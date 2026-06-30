const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const runCode = (code, input) => {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const tempDir = path.join(__dirname, 'temp');

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        const codePath = path.join(tempDir, `solution_${timestamp}.cpp`);
        const inputPath = path.join(tempDir, `input_${timestamp}.txt`);

        fs.writeFileSync(codePath, code);
        fs.writeFileSync(inputPath, input);

        // Copy files into container
        exec(`docker cp ${codePath} oj-gcc:/tmp/solution_${timestamp}.cpp`, (err) => {
            if (err) return resolve({ verdict: 'System Error', output: err.message });

            exec(`docker cp ${inputPath} oj-gcc:/tmp/input_${timestamp}.txt`, (err) => {
                if (err) return resolve({ verdict: 'System Error', output: err.message });

                // Compile inside container
                exec(
                    `docker exec oj-gcc g++ /tmp/solution_${timestamp}.cpp -o /tmp/solution_${timestamp}`,
                    (compileErr, _, compileStderr) => {
                        if (compileErr) {
                            cleanup(codePath, inputPath);
                            return resolve({ verdict: 'Compilation Error', output: compileStderr });
                        }

                        // Run inside container with timeout
                        exec(
                            `docker exec oj-gcc sh -c "/tmp/solution_${timestamp} < /tmp/input_${timestamp}.txt"`,
                            { timeout: 2000 },
                            (runErr, stdout, stderr) => {
                                cleanup(codePath, inputPath);

                                if (runErr && runErr.killed) {
                                    return resolve({ verdict: 'Time Limit Exceeded', output: '' });
                                }
                                if (runErr) {
                                    return resolve({ verdict: 'Runtime Error', output: stderr });
                                }

                                resolve({ verdict: 'Success', output: stdout.trim() });
                            }
                        );
                    }
                );
            });
        });
    });
};

const cleanup = (...files) => {
    files.forEach(f => {
        if (fs.existsSync(f)) fs.unlinkSync(f);
    });
};

module.exports = runCode;