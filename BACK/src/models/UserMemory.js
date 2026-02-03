const mongoose = require('mongoose');

const userMemorySchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    countryCode: { type: String, required: true },
    // Mise à jour de l'enum avec 'anecdote'
    factType: {
        type: String,
        enum: ['flag', 'capital', 'location', 'anecdote'],
        required: true
    },

    // Pour les anecdotes, on peut stocker l'ID du step ou du fait précis
    specificDataId: { type: String, default: null },

    easeFactor: { type: Number, default: 2.5 },
    interval: { type: Number, default: 0 },
    repetition: { type: Number, default: 0 },

    dueDate: { type: Date, default: Date.now },
    lastReviewedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index composé existant
userMemorySchema.index({ userId: 1, dueDate: 1 });
userMemorySchema.index({ userId: 1, countryCode: 1, factType: 1, specificDataId: 1 }, { unique: true });

module.exports = mongoose.model('UserMemory', userMemorySchema);