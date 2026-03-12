let mongoose = require('mongoose');

let roleSchema = mongoose.Schema({
    id: {
        type: String,
        unique: true,
        sparse: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: ""
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('role', roleSchema)
