const mongoose = require('mongoose');

const pipelineSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        default: 'Untitled Pipeline'
    },
    description: {
        type: String,
        default: ''
    },
    nodes: {
        type: Array,
        default: []
    },
    edges: {
        type: Array,
        default: []
    },
    lastResults: {
        type: Object,
        default: null
    },
    status: {
        type: String,
        enum: ['draft', 'running', 'completed', 'failed'],
        default: 'draft'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

pipelineSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Pipeline', pipelineSchema);
