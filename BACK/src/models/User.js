// models/User.js
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const passportEntrySchema = new mongoose.Schema({
    hasFlag: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    storiesDone: [{ type: String }],
    lastVisitedAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    pseudo: { type: String, required: false },

    // Nettoyage ici : suppression de avatarID et unlockedAvatarIDs
    selectedFlag: { type: String, default: null },

    // Passeport
    passport: {
        type: Map,
        of: passportEntrySchema,
        default: {}
    },

    inventory: { type: [String], default: [] },

    energy: { type: Number, default: 10 },
    coins: { type: Number, default: 0 },
    dayStreak: { type: Number, default: 0 },

    currentStoryId: { type: String, default: null },
    expoPushToken: { type: String },
    code: { type: String },
}, { timestamps: true });

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);