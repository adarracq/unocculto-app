const Story = require('../models/Story');
const User = require('../models/User');

exports.getByID = async (req, res, next) => {
    console.log("Fetching story by ID: " + req.params.id);
    try {
        const story = await Story.findOne({ storyId: req.params.id });
        res.status(200).json(story);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.getNextByCountryCode = async (req, res, next) => {
    try {
        const countryCode = req.params.countryCode;
        // On suppose que l'ID du user est dans req.auth.userId (via ton middleware d'auth)
        // Sinon adapte selon ton système (req.body.userId, etc.)
        const userId = req.auth.userId;

        // 1. Récupérer le User pour voir son historique
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 2. Lister les IDs des stories DÉJÀ complétées pour ce pays
        const completedStoryIds = user.travelLog
            .filter(log => log.countryCode === countryCode)
            .map(log => log.storyId);

        // 3. STRATÉGIE : CAPITALE D'ABORD
        // On vérifie si la capitale a été faite
        const capitalStory = await Story.findOne({
            countryCode: countryCode,
            isCapital: true
        });

        // Si la capitale existe et n'est PAS dans la liste des complétées -> On la sert
        if (capitalStory && !completedStoryIds.includes(capitalStory.storyId)) {
            return res.status(200).json(capitalStory);
        }

        // 4. STRATÉGIE : EXPLORATION (Random)
        // On cherche toutes les stories du pays SAUF celles déjà faites
        const availableStories = await Story.find({
            countryCode: countryCode,
            storyId: { $nin: completedStoryIds } // $nin = Not In
        });

        if (availableStories.length > 0) {
            // Tirage au sort simple
            // (Tu pourras ajouter de la logique de rareté ici plus tard)
            const randomIndex = Math.floor(Math.random() * availableStories.length);
            const nextStory = availableStories[randomIndex];

            return res.status(200).json(nextStory);
        }

        // 5. CAS : TOUT EST FINI
        // Le user a fait toutes les stories dispos pour ce pays
        return res.status(200).json({
            message: 'Country fully explored',
            allCompleted: true
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération de la story' });
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
        }).select('storyId countryCode city title rarity isCapital');

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

        res.status(200).json(selection);

    } catch (error) {
        console.error('Error fetching destinations:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};