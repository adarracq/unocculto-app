const Story = require('../models/Story');
const User = require('../models/User');
const Collectible = require('../models/Collectible');

exports.getByID = async (req, res, next) => {
    console.log("Fetching story by ID: " + req.params.id);
    try {
        const story = await Story.findOne({ storyId: req.params.id });
        console.log("Story found: " + (story ? story.storyId : "None"));
        if (story && story.rewardCollectibleId) {
            const collectible = await Collectible.findOne({ id: story.rewardCollectibleId });
            if (collectible) {
                story._doc.collectible = collectible;
            }
        }
        console.log("Next story selected: " + story.storyId);
        console.log("Next story selected: " + story.rewardCollectibleId);
        res.status(200).json(story);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.getAvailableDestinations = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // --- 1. Lister les IDs des stories déjà faites ---
        // Le passeport est une Map : { "FR": { storiesDone: [...] }, "JP": { ... } }
        // On doit parcourir toutes les entrées pour accumuler tous les IDs dans un seul tableau.

        let completedIds = [];

        // Si user.passport est une Map Mongoose, on utilise .values() ou on itère dessus
        if (user.passport) {
            // Note : user.passport.values() renvoie un itérateur, on peut boucler dessus
            for (const entry of user.passport.values()) {
                if (entry.storiesDone && Array.isArray(entry.storiesDone)) {
                    completedIds = completedIds.concat(entry.storiesDone);
                }
            }
        }

        // --- 2. Trouver toutes les stories NON faites ---
        // On exclut aussi la story actuellement sélectionnée (si elle existe) pour ne pas la reproposer
        if (user.currentStoryId) {
            completedIds.push(user.currentStoryId);
        }

        // Requête MongoDB : On cherche tout ce qui n'est PAS dans completedIds
        const availableStories = await Story.find({
            storyId: { $nin: completedIds }
        }).select('storyId countryCode city title rarity isCapital category subCategory'); // On peut sélectionner uniquement les champs nécessaires pour la liste

        // --- 3. Mélange (Fisher-Yates) ---
        for (let i = availableStories.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableStories[i], availableStories[j]] = [availableStories[j], availableStories[i]];
        }

        // --- 4. Sélection ---
        const selection = availableStories.slice(0, 4);

        // Cas limite : Si le joueur a TOUT fini (tableau vide), 
        // on peut décider de renvoyer des stories au hasard (Replay mode)
        if (selection.length === 0) {
            const replayStories = await Story.find().limit(4);
            // Mélange rapide pour le replay
            return res.status(200).json(replayStories.sort(() => 0.5 - Math.random()));
        }
        console.log(`User ${selection}`);
        res.status(200).json(selection);

    } catch (error) {
        console.error('Error fetching destinations:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};