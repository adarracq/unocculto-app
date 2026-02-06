// models/GameResult.js
const mongoose = require('mongoose');

const gameResultSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Dénormalisation (On copie pseudo/avatar pour afficher le leaderboard VITE sans faire de "join" couteux)
    pseudo: { type: String },
    selectedFlag: { type: String }, // Pour l'avatar dans le classement

    // Contexte du jeu
    mode: { type: String, required: true, enum: ['country', 'flag', 'capital'] },
    region: { type: String, required: true }, // 'EUR', 'AFR'...
    lvl: { type: Number, required: true }, // 1, 2, 3...

    // Performance
    score: { type: Number, required: true }, // Le score calculé (ex: 1000 pts)
    timeTaken: { type: Number, required: true }, // Secondes
    accuracy: { type: Number, default: 100 }, // % de précision

    // Métadonnées
    isPerfect: { type: Boolean, default: false }, // Si 100% precision
    xpEarned: { type: Number, default: 0 },

    playedAt: { type: Date, default: Date.now }
});

// --- INDEXES (CRUCIAL POUR LES PERFORMANCES) ---

// 1. Pour le Leaderboard "High Score" par niveau (Top 10 Monde)
gameResultSchema.index({ mode: 1, region: 1, levelId: 1, score: -1 });

// 2. Pour le Leaderboard "Hebdomadaire" (Score + Date)
gameResultSchema.index({ playedAt: -1, score: -1 });

// 3. Pour l'historique du joueur
gameResultSchema.index({ userId: 1, playedAt: -1 });

module.exports = mongoose.model('GameResult', gameResultSchema);