const sendSuccess = (res, statusCode, message, data = undefined) => {
    const payload = { success: true, message };
    if (data !== undefined) payload.data = data;
    return res.status(statusCode).json(payload);
};

const sendError = (res, statusCode, message, details = undefined) => {
    const payload = { success: false, message };
    if (details !== undefined) payload.details = details;
    return res.status(statusCode).json(payload);
};

module.exports = { sendSuccess, sendError };
