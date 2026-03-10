const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    description: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false } // Dùng để xoá mềm
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);