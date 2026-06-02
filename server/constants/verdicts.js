const VERDICTS = Object.freeze({
    ACCEPTED: 'AC',
    WRONG_ANSWER: 'WA',
    TIME_LIMIT_EXCEEDED: 'TLE',
    RUNTIME_ERROR: 'RE',
    COMPILATION_ERROR: 'CE',
    SYSTEM_ERROR: 'SE'
});

const VERDICT_LABELS = Object.freeze({
    [VERDICTS.ACCEPTED]: 'Accepted',
    [VERDICTS.WRONG_ANSWER]: 'Wrong Answer',
    [VERDICTS.TIME_LIMIT_EXCEEDED]: 'Time Limit Exceeded',
    [VERDICTS.RUNTIME_ERROR]: 'Runtime Error',
    [VERDICTS.COMPILATION_ERROR]: 'Compilation Error',
    [VERDICTS.SYSTEM_ERROR]: 'System Error'
});

module.exports = { VERDICTS, VERDICT_LABELS };
