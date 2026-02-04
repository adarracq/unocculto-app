// backend/seeds/index.js
require('dotenv').config(); // Pour charger ton process.env.MONGO_URI
const mongoose = require('mongoose');
const Story = require('../../models/Story');
const fs = require('fs');
const path = require('path');

// 1. Connexion BDD
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('SEEDING: Connecté à MongoDB'))
    .catch(err => console.error('SEEDING: Erreur connexion', err));

const seedStories = async () => {
    try {
        // 2. Lire le fichier JSON
        const filePath = path.join(__dirname, 'stories', 'intro.json');
        const rawData = fs.readFileSync(filePath);
        const stories = JSON.parse(rawData);

        console.log(`SEEDING: ${stories.length} histoires trouvées...`);

        // 3. Boucle d'Upsert (Update or Insert)
        for (const story of stories) {
            await Story.findOneAndUpdate(
                { storyId: story.storyId }, // Critère de recherche
                story, // Nouvelles données
                { upsert: true, new: true, setDefaultsOnInsert: true } // Options
            );
            console.log(`--> Histoire traitée : ${story.storyId}`);
        }

        console.log('SEEDING TERMINÉ AVEC SUCCÈS 🚀');
        process.exit(0);

    } catch (error) {
        console.error('SEEDING ERROR:', error);
        process.exit(1);
    }
};

seedStories();
//node scripts/seeds/stories.js