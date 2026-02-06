// models/User.js
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Schéma pour le Passeport (Existant)
const passportEntrySchema = new mongoose.Schema({
    hasFlag: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    storiesDone: [{ type: String }],
    lastVisitedAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    pseudo: { type: String, required: false },

    selectedFlag: { type: String, default: null },

    // Passeport (Mode Histoire)
    passport: {
        type: Map,
        of: passportEntrySchema,
        default: {}
    },

    // --- NOUVEAU : PROGRESSION ARCADE ---
    // Structure: { "AFR": { "flag": { levels: { "1": { unlocked: true... } } } } }
    // On utilise Map of Mixed pour gérer la flexibilité des clés imbriquées
    progression: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },

    inventory: { type: [String], default: [] },

    fuel: { type: Number, default: 10 },
    xp: { type: Number, default: 0 },
    dayStreak: { type: Number, default: 0 },
    isPremium: { type: Boolean, default: false },
    storiesPlayedCount: { type: Number, default: 0 },
    lastStoryPlayedAt: { type: Date, default: null },

    currentStoryId: { type: String, default: null },
    expoPushToken: { type: String },
    code: { type: String },
}, { timestamps: true });

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);