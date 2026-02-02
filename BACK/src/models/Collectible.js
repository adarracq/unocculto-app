// models/Collectible.js
const mongoose = require('mongoose');

const collectibleSchema = mongoose.Schema({
    id: { type: String, required: true, unique: true }, // 'inv_minitel', 'art_monalisa'
    type: {
        type: String,
        enum: ['monument', 'food', 'invention', 'art', 'nature'],
        required: true
    },
    name: { type: String, required: true },
    description: { type: String, required: true }, // Le petit texte éducatif
    imageUrl: { type: String, required: true },
    countryCode: { type: String, required: true },
    rarity: { type: String, default: 'common' }
});

module.exports = mongoose.model('Collectible', collectibleSchema);