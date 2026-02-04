// src/scripts/seeds/collectibles.js
require('dotenv').config();
const mongoose = require('mongoose');
const Collectible = require('../../models/Collectible');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Connection error:', err));

const items = [
    // --- DÉPARTEMENT: HUMANITÉS (Archives Humaines) ---
    {
        id: "hist_berlin_wall",
        type: "history",
        name: "Fragment du Mur",
        description: "Un morceau de béton peint arraché à l'histoire un soir de novembre 1989. Il porte encore les cicatrices de la séparation.",
        imageUrl: "https://img.icons8.com/color/480/wall.png",
        countryCode: "DE",
        rarity: "rare"
    },
    {
        id: "philo_scroll",
        type: "philosophy",
        name: "Parchemin Stoïcien",
        description: "Une copie ancienne des pensées de Marc Aurèle. Le lire apaise l'esprit avant un vol turbulent.",
        imageUrl: "https://img.icons8.com/color/480/scroll.png",
        countryCode: "GR",
        rarity: "uncommon"
    },
    {
        id: "eco_coin",
        type: "economy",
        name: "Drachme Antique",
        description: "Une pièce d'argent frappée à Athènes. Témoin silencieux de la naissance du commerce maritime.",
        imageUrl: "https://img.icons8.com/color/480/average-2.png", // Icone pièce
        countryCode: "GR",
        rarity: "common"
    },
    {
        id: "lit_feather",
        type: "literature",
        name: "Plume de Poète",
        description: "Une plume d'oie taillée, retrouvée dans un grenier près de Stratford-upon-Avon. L'encre semble encore fraîche.",
        imageUrl: "https://img.icons8.com/color/480/feather.png",
        countryCode: "GB",
        rarity: "legendary"
    },
    {
        id: "rel_omamori",
        type: "religion",
        name: "Omamori de Sécurité",
        description: "Une amulette japonaise dédiée à la protection des voyageurs. Indispensable dans le cockpit.",
        imageUrl: "https://img.icons8.com/color/480/amulet.png",
        countryCode: "JP",
        rarity: "common"
    },
    {
        id: "pol_badge",
        type: "politics",
        name: "Badge 'I Have a Dream'",
        description: "Un badge original de la marche sur Washington. Un petit objet pour une grande histoire.",
        imageUrl: "https://img.icons8.com/color/480/vote.png",
        countryCode: "US",
        rarity: "rare"
    },

    // --- DÉPARTEMENT: ARTS (Galerie Culturelle) ---
    {
        id: "art_ukiyo",
        type: "art",
        name: "Estampe Ukiyo-e",
        description: "Une représentation du Mont Fuji sous la vague. Les couleurs n'ont pas bougé depuis l'ère Edo.",
        imageUrl: "https://img.icons8.com/color/480/picture.png",
        countryCode: "JP",
        rarity: "rare"
    },
    {
        id: "mus_vinyl",
        type: "music",
        name: "Vinyle de Jazz 1950",
        description: "Un pressage original trouvé dans une cave de New York. On entend presque le saxophone crépiter.",
        imageUrl: "https://img.icons8.com/color/480/vinyl-record.png",
        countryCode: "US",
        rarity: "uncommon"
    },
    {
        id: "sport_glove",
        type: "sport",
        name: "Gant de Boxe Vintage",
        description: "Cuir patiné par les combats. Il sent la sueur et la victoire d'un gymnase de Philadelphie.",
        imageUrl: "https://img.icons8.com/color/480/boxing-glove.png",
        countryCode: "US",
        rarity: "common"
    },
    {
        id: "cul_mask",
        type: "culture",
        name: "Masque Vénitien",
        description: "Un masque de carnaval aux dorures complexes. Il cache bien des secrets de la Sérénissime.",
        imageUrl: "https://img.icons8.com/color/480/carnival-mask.png",
        countryCode: "IT",
        rarity: "uncommon"
    },

    // --- DÉPARTEMENT: SCIENCES (Laboratoire & Monde) ---
    {
        id: "sci_micro",
        type: "science",
        name: "Lentille de Pasteur",
        description: "Un morceau de verre optique ancien. Il a permis de voir l'invisible pour la première fois.",
        imageUrl: "https://img.icons8.com/color/480/microscope.png",
        countryCode: "FR",
        rarity: "legendary"
    },
    {
        id: "tech_chip",
        type: "tech",
        name: "Prototype de Puce",
        description: "Un des premiers circuits intégrés en silicium. La base de toute notre modernité.",
        imageUrl: "https://img.icons8.com/color/480/microchip.png",
        countryCode: "US",
        rarity: "rare"
    },
    {
        id: "geo_compass",
        type: "geography",
        name: "Compas d'Explorateur",
        description: "Il pointe toujours le Nord, mais son aiguille tremble quand on approche des lieux inexplorés.",
        imageUrl: "https://img.icons8.com/color/480/compass--v1.png",
        countryCode: "PT",
        rarity: "common"
    },
    {
        id: "nat_amber",
        type: "nature",
        name: "Ambre Balte",
        description: "Une résine fossilisée contenant un insecte préhistorique. Une capsule temporelle naturelle.",
        imageUrl: "https://img.icons8.com/color/480/stone.png",
        countryCode: "LV", // Lettonie
        rarity: "uncommon"
    },
    {
        id: "psy_ink",
        type: "psychology",
        name: "Tache de Rorschach",
        description: "Une carte originale du test psychologique. Que voyez-vous ? Un papillon ou un avion ?",
        imageUrl: "https://img.icons8.com/color/480/mental-health.png",
        countryCode: "CH",
        rarity: "rare"
    }
];

const seed = async () => {
    try {
        /*await Collectible.deleteMany({});
         console.log('🧹 Hangar emptied.');*/

        await Collectible.insertMany(items);
        console.log(`📦 Hangar restocked with ${items.length} new items!`);

        process.exit();
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seed();