const mongoose = require('mongoose');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const collectMissingFields = (body, fields) => fields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
});

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : value);

module.exports = {
    collectMissingFields,
    isNonEmptyString,
    isValidObjectId,
    normalizeString
};
