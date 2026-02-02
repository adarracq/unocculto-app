// models/Score.js
const mongoose = require('mongoose');

const scoreSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pseudo: { type: String, required: true }, // Dénormalisé pour éviter les $lookup lents
    avatarID: { type: Number, required: true },
    flag: { type: String, required: false }, // Le drapeau choisi par le joueur

    gameId: { type: String, required: true }, // ex: 'order_game_fr_1'
    score: { type: Number, required: true },

    weekNumber: { type: Number, required: true }, // ex: 34 (pour tri hebdo)
    year: { type: Number, required: true }, // ex: 2024
}, { timestamps: true });

// Index pour rendre le classement ultra rapide
// On veut trier par jeu, par semaine, et par score décroissant
scoreSchema.index({ gameId: 1, year: 1, weekNumber: 1, score: -1 });

module.exports = mongoose.model('Score', scoreSchema);