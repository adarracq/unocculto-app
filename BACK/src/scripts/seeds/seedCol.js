require('dotenv').config(); // Pour charger ton process.env.MONGO_URI
const mongoose = require('mongoose');
const Collectible = require('../../models/Collectible');
const fs = require('fs');
const path = require('path');

// 1. Connexion BDD
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('SEEDING: Connecté à MongoDB'))
    .catch(err => console.error('SEEDING: Erreur connexion', err));

const seedCollectibles = async () => {
    try {
        // 2. Lire le fichier JSON
        const filePath = path.join(__dirname, 'collectibles', 'collectibles.json');
        const rawData = fs.readFileSync(filePath);
        const collectibles = JSON.parse(rawData);

        console.log(`SEEDING: ${collectibles.length} collectibles trouvées...`);

        // 3. Boucle d'Upsert (Update or Insert)
        for (const collectible of collectibles) {
            await Collectible.findOneAndUpdate(
                { id: collectible.id }, // Critère de recherche
                collectible, // Nouvelles données
                { upsert: true, new: true, setDefaultsOnInsert: true } // Options
            );
            console.log(`--> Collectible traitée : ${collectible.id}`);
        }

        console.log('SEEDING TERMINÉ AVEC SUCCÈS 🚀');
        process.exit(0);

    } catch (error) {
        console.error('SEEDING ERROR:', error);
        process.exit(1);
    }
};

seedCollectibles();
//node src/scripts/seeds/seedCol.js