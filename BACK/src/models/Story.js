const mongoose = require('mongoose');

// Schéma pour les cartes du jeu SWIPE
// Pas besoin d'un modèle à part entière, c'est une sous-structure.
const swipeCardSchema = new mongoose.Schema({
    id: { type: String, required: true },
    imageUrl: { type: String, required: true }, // Le drapeau
    text: { type: String, default: '' },        // Nom du pays (optionnel)
    isCorrect: { type: Boolean, required: true }
}, { _id: false }); // On évite de générer un _id mongo pour chaque carte, c'est inutile ici

const anecdoteSchema = new mongoose.Schema({
    id: { type: String, required: true }, // ex: "fr_eiffel_height"
    type: {
        type: String,
        enum: ['numeric', 'true_false', 'order', 'choice', 'visual'],
        required: true
    },

    // Le savoir à transmettre (affiché en dialogue avant le jeu ou en explication après)
    lesson: { type: String, required: true },

    // --- DONNÉES POLYMORPHIQUES ---

    // Pour 'numeric' (Estimation / Quiz)
    label: { type: String, required: false },       // Ce qu'on estime (hauteur, population...)
    numericValue: { type: Number },
    unit: { type: String }, // 'm', 'km', 'hab'...

    // Pour 'true_false' (Swipe)
    statement: { type: String }, // "La Tour Eiffel a été construite en 1900"
    isTrue: { type: Boolean },
    isText: { type: Boolean }, // true = texte, false = image

    // Pour 'order' (OrderGame)
    items: [{ type: String }], // ["Pétrir", "Cuire", "Manger"] (Dans l'ordre)

    // Pour 'choice' (Quiz classique)
    question: { type: String },
    correctAnswer: { type: String },
    distractors: [{ type: String }],

    // Image contextuelle (optionnelle)
    imageUri: { type: String }
}, { _id: false });

const storyStepSchema = mongoose.Schema({
    id: { type: String, required: true },
    type: {
        type: String,
        // MISE À JOUR : Ajout des nouveaux types de jeux
        enum: ['dialogue', 'quiz', 'order', 'reward', 'location', 'swipe', 'estimation'],
        required: true
    },
    // Champs communs
    title: { type: String, required: true },
    content: { type: String, required: true },
    duration: { type: Number, required: false }, // Pour l'autoplay
    imageUrl: { type: String, required: false }, // Image de fond/illustration générique

    // --- SPÉCIFIQUE REWARD ---
    rewardImage: { type: String, required: false },

    // --- SPÉCIFIQUE QUIZ ---
    choices: { type: [String], required: false },
    correctAnswerIndex: { type: Number, required: false },
    explanation: { type: String, required: false },
    answerType: { type: String, enum: ['text', 'image'], required: false },

    // --- SPÉCIFIQUE ORDER ---
    orderItems: { type: [String], required: false },

    // --- SPÉCIFIQUE SWIPE (Nouveau) ---
    deck: { type: [swipeCardSchema], required: false },

    // --- SPÉCIFIQUE ESTIMATION (Nouveau) ---
    targetValue: { type: Number, required: false }, // La bonne réponse
    currency: { type: String, required: false },    // €, $, ¥...
    min: { type: Number, required: false },
    max: { type: Number, required: false },
    imageUri: { type: String, required: false },    // L'objet à estimer (distinct de imageUrl qui est le fond)
    tolerance: { type: Number, required: false },   // Marge d'erreur
    step: { type: Number, required: false },        // Pas du slider (ex: 10, 50)

    // Navigation
    nextStepId: { type: String, required: false } // null = fin
});

const storySchema = mongoose.Schema({
    storyId: { type: String, required: true, unique: true }, // ex: 'fr_paris_1'
    countryCode: { type: String, required: true, index: true }, // 'FR'

    city: { type: String, required: true },
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'legendary'],
        default: 'common'
    },
    isCapital: { type: Boolean, default: false },

    // Contenu
    title: { type: String, required: true },
    steps: [storyStepSchema],

    timeline: [
        {
            type: { type: String, enum: ['dialogue', 'anecdote'], required: true },

            // Si type === 'dialogue'
            content: { type: String },
            characterId: { type: String }, // Qui parle ?

            // Si type === 'anecdote'
            data: anecdoteSchema
        }
    ],

    // Récompense liée
    rewardCollectibleId: { type: String, required: false },
    xpReward: { type: Number, default: 100 },
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);