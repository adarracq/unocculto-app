// src/models/Collectible.js
const mongoose = require('mongoose');

const collectibleSchema = mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true }, // ex: 'compas_aeropostale'

    // Catégorisation pour le filtre dans le Musée
    type: {
        type: String,
        enum: [
            // --- Humanités ---
            'history', 'philosophy', 'literature', 'religion', 'politics', 'geopolitics', 'economy',
            // --- Arts & Culture ---
            'art', 'music', 'sport', 'culture',
            // --- Sciences & Monde ---
            'science', 'psychology', 'geography', 'tech', 'nature'
        ],
        required: true
    },

    // Infos d'affichage
    name: { type: String, required: true },
    description: { type: String, required: true }, // Le Lore

    // L'URL distante de l'image (ex: "https://mon-serveur.com/images/compass.png")
    imageUrl: { type: String, required: true },

    // Infos méta
    countryCode: { type: String, required: true }, // Pour lier au voyage
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'legendary'],
        default: 'common'
    }
});

module.exports = mongoose.model('Collectible', collectibleSchema);