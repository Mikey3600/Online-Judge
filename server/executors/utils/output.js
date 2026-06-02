const normalizeOutput = (value = '') => {
    return value
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n')
        .trim();
};

module.exports = { normalizeOutput };
