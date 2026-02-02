const mongoose = require('mongoose');

const storyStepSchema = mongoose.Schema({
    id: { type: String, required: true },
    type: {
        type: String,
        enum: ['dialogue', 'quiz', 'order', 'reward'],
        required: true
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    duration: { type: Number, required: false },

    // Ressources visuelles
    imageUrl: { type: String, required: false },
    rewardImage: { type: String, required: false },

    // Spécifique QUIZ
    choices: { type: [String], required: false },
    correctAnswerIndex: { type: Number, required: false },
    explanation: { type: String, required: false },
    answerType: { type: String, enum: ['text', 'image'], required: false },

    // Spécifique ORDER
    orderItems: { type: [String], required: false }, // Les items dans le bon ordre

    // Navigation
    nextStepId: { type: String, required: false } // null = fin de l'histoire
});

const storySchema = mongoose.Schema({
    storyId: { type: String, required: true, unique: true }, // ex: 'fr_paris_1'
    countryCode: { type: String, required: true, index: true }, // 'FR'

    city: { type: String, required: true }, // ex: 'Paris', 'Lyon'
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'legendary'],
        default: 'common'
    },
    // Est-ce la capitale ? (Sera toujours le 1er voyage proposé)
    isCapital: { type: Boolean, default: false },

    // --- CONTENU (Gameplay) ---
    title: { type: String, required: true }, // ex: "Lumières de Paris"
    steps: [storyStepSchema],

    // --- RECOMPENSES (Tes idées : Œuvres, Inventions...) ---
    // Au lieu d'une image simple, on lie à un objet de collection
    rewardCollectibleId: { type: String, required: false }, // ex: 'monument_tour_eiffel'
    xpReward: { type: Number, default: 100 },
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);