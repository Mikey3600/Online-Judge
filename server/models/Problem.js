const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    statement: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' }
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);
