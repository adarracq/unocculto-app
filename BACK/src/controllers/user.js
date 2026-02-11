const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Story = require('../models/Story');
const sendEmail = require("../scripts/email");
const mongoose = require('mongoose');
const UserMemory = require('../models/UserMemory');
const Collectible = require('../models/Collectible');

exports.loginOrSignup = (req, res, next) => {

    const email = req.body.email;
    // create a 6 digits random code
    let code = Math.floor(100000 + Math.random() * 900000).toString();

    if (email == 'antoine.cheval.darracq@gmail.com')
        code = '123456';

    User.findOne({ email: email })
        .then(user => {
            // if user does not exist, create a new user and send email code
            if (!user) {
                const user = new User({
                    email: email,
                    code: code,
                });

                user.save()
                    .then(() => {
                        /*sendEmail(user.email, "Code de verification", `
                            <html lang="fr">    
                                <body>
                                <p>
                                    Votre code de vérification est <strong>${code}</strong>
                                </p>
                                </body>
                            </html>
                                `)
                            .then(() => {
                                const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
                                res.status(201).json({ message: 'signup', token: token });
                            })
                            .catch(error => res.status(400).json({ error: 'Email not sent' }));*/
                        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
                        res.status(201).json({ message: 'signup', token: token });
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(400).json({ error: 'Cannot create user' });
                    });
            }
            // if user exists, send email code and add it to the user
            else {
                const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
                if (user.pseudo) {
                    res.status(201).json({ message: 'login', token: token });
                }
                else {
                    res.status(201).json({ message: 'signup', token: token });
                }
                /*sendEmail(user.email, "Code de verification", `
                <html lang="fr">    
                    <body>
                    <p>
                        Votre code de vérification est <strong>${code}</strong>
                    </p>
                    </body>
                </html>
                    `)
                    .then(() => {
                        user.code = code;
                        // update user code
                        User.findOneAndUpdate(
                            { email: email },
                            { code: code },
                            { new: true })
                            .then((user) => {
                                const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
                                if (user.verified && user.firstname) {
                                    res.status(201).json({ message: 'login', token: token });
                                }
                                else {
                                    res.status(201).json({ message: 'signup', token: token });
                                }
                            })
                            .catch(error => res.status(400).json({ error: 'Email not sent' }));
                    })
                    .catch(error => res.status(400).json({ error: 'Email not sent' }));*/
            }
        })
        .catch(error => res.status(500).json({ error: 'Internal Error' }));
};

exports.verifyEmailCode = (req, res, next) => {

    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Not Found' });
            }
            if (user.code != req.body.code) {
                console.log("Wrong code: " + req.body.code + " expected: " + user.code);
                return res.status(401).json({ error: 'Wrong Code' });
            }
            // if user is banned
            if (user.status == -1) {
                return res.status(401).json({ error: 'User banned' });
            }
            User.findOneAndUpdate(
                { email: req.body.email },
                { verified: true },
                { new: true })
                .then((user) => {
                    res.status(201).json({ message: 'Code verified', type: user.type });
                })
                .catch(error => res.status(400).json({ error: 'Not Found' }));
        })
        .catch(error => res.status(500).json({ error: 'Internal Error' }));
};

exports.getUserByEmail = (req, res, next) => {

    User.findOne({ email: req.params.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Not Found' });
            }
            res.status(201).json(user);
        })
        .catch(error => res.status(400).json({ error: 'Not Found' }));
};

exports.getUserById = (req, res, next) => {
    User.findOne({ _id: req.params.id })
        .then(user => res.status(200).json(user))
        .catch(error => res.status(404).json({ error: 'Not Found' }));
}

exports.updateUser = (req, res, next) => {
    // remove _id from req.body.user
    delete req.body.user._id;

    User.findOneAndUpdate(
        { email: req.body.user.email },
        { ...req.body.user },
        { new: true })
        .then((user) => {
            // send email to verify user
            if (req.body.toValidate)
                sendEmailToVerifyUser(user);

            res.status(201).json(user);
        })
        .catch((error) => {
            console.log(error);
            res.status(400).json({ error: 'Not Found' })
        });
}

exports.updateExpoPushToken = (req, res, next) => {
    User.findOneAndUpdate(
        { email: req.body.email },
        { expoPushToken: req.body.token },
        { new: true })
        .then((user) => res.status(200).json(user))
        .catch(error => res.status(400).json({ error: 'Not Found' }));
}

exports.verifyPseudo = (req, res, next) => {
    const pseudo = req.params.pseudo;
    console.log("Verifying pseudo: " + pseudo);

    User.findOne({ pseudo: pseudo })
        .then(user => {
            if (user) {
                return res.status(200).json({ available: false });
            }
            else {
                return res.status(200).json({ available: true });
            }
        })
        .catch(error => res.status(500).json({ error: 'Internal Error' }));
}

exports.completeStory = async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        const { storyId, countryCode, score } = req.body;

        const user = await User.findById(userId);
        const story = await Story.findOne({ storyId: storyId });

        // Filtrer uniquement les anecdotes de la timeline
        const anecdotesInStory = story.timeline
            .filter(item => item.type === 'anecdote')
            .map(item => item.data);

        if (!user || !story) {
            return res.status(404).json({ error: 'User or Story not found' });
        }

        // --- 1. INITIALISATION DE L'ENTRÉE PAYS (Si pas encore visité) ---
        if (!user.passport.has(countryCode)) {
            user.passport.set(countryCode, {
                hasFlag: false,
                isCompleted: false,
                storiesDone: [],
                lastVisitedAt: new Date()
            });
        }

        const countryEntry = user.passport.get(countryCode);

        // --- 2. GESTION DU DRAPEAU (Dès la 1ère visite) ---
        let flagUnlocked = false;
        if (!countryEntry.hasFlag) {
            countryEntry.hasFlag = true;
            flagUnlocked = true;
        }

        // --- 3. HISTORIQUE & RÉCOMPENSES ---
        const alreadyPlayed = countryEntry.storiesDone.includes(storyId);

        if (!alreadyPlayed) {
            countryEntry.storiesDone.push(storyId);
        }

        countryEntry.lastVisitedAt = new Date();

        // Calcul XP (Divisé par 2 si replay)
        const xpEarned = alreadyPlayed ? Math.floor(story.xpReward / 2) : story.xpReward;

        // Collectible
        let newCollectible = null;
        if (!alreadyPlayed && story.rewardCollectibleId) {
            if (!user.inventory.includes(story.rewardCollectibleId)) {
                user.inventory.push(story.rewardCollectibleId);
                newCollectible = story.rewardCollectibleId;
            }
        }

        // --- 4. VÉRIFICATION 100% (Badge Or) ---
        let countryCompleted = false;
        if (!countryEntry.isCompleted) {
            const totalStories = await Story.countDocuments({ countryCode: countryCode });
            if (countryEntry.storiesDone.length >= totalStories) {
                countryEntry.isCompleted = true;
                countryCompleted = true;
            }
        }

        user.storiesPlayedCount = (user.storiesPlayedCount || 0) + 1;

        // --- GESTION DU DAY STREAK ---
        const now = new Date();
        const lastPlayDate = user.lastStoryPlayedAt ? new Date(user.lastStoryPlayedAt) : null;

        if (!lastPlayDate) {
            // Première histoire jamais jouée
            user.dayStreak = 1;
        } else {
            const dayDiff = Math.floor((now - lastPlayDate) / (1000 * 60 * 60 * 24));

            if (dayDiff === 0) {
                // Même jour, ne rien changer au dayStreak
            } else if (dayDiff === 1) {
                // Jour suivant, incrémenter
                user.dayStreak = (user.dayStreak || 0) + 1;
            } else {
                // Plus d'un jour écoulé, réinitialiser
                user.dayStreak = 1;
            }

            // on rajoute le fuel si le user n'est pas premium
            if (dayDiff > 0 && user.isPremium == false) {
                user.fuel = 5;
            }
        }

        user.lastStoryPlayedAt = new Date();

        // --- 5. SAUVEGARDE ---
        user.xp += xpEarned;
        user.passport.set(countryCode, countryEntry);
        user.currentStoryId = null;
        await user.save();

        // --- 6. GESTION DES SOUVENIRS UTILISATEUR (SRS) ---
        // C'est ici qu'on initialise les cartes de révision pour ce pays
        if (!alreadyPlayed) {
            // 1. Sauvegarder les classiques (Drapeau, Capital, Geo)
            const memoriesToCreate = [
                { userId, countryCode, factType: 'flag' },
                { userId, countryCode, factType: 'capital' },
                { userId, countryCode, factType: 'location' },
                // ✅ AJOUT : Les anecdotes spécifiques de la story
                ...anecdotesInStory.map(anecdote => ({
                    userId,
                    countryCode,
                    factType: 'anecdote',
                    specificDataId: String(anecdote.id || anecdote._id || anecdote.title),
                    specificData: anecdote
                }))
            ];

            // insertMany avec ordered:false permet de continuer même si certaines entrées existent déjà (doublons ignorés)
            try {
                await UserMemory.insertMany(memoriesToCreate, { ordered: false });
            } catch (e) {
                // On ignore silencieusement les erreurs de duplicata (E11000) 
                // car ça veut dire que l'utilisateur a déjà débloqué ce pays via une autre story
            }
        }

        // --- 7. RÉPONSE ---
        res.status(200).json({
            success: true,
            earned: {
                xp: xpEarned,
                collectible: newCollectible
            },
            flagUnlocked: flagUnlocked,
            countryCompleted: countryCompleted,
            updatedUser: {
                passport: user.passport,
                inventory: user.inventory,
                fuel: user.fuel,
                xp: user.xp,
                currentStoryId: null
            }
        });

    } catch (error) {
        console.error('Error completing story:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateCurrentStoryId = (req, res, next) => {
    const userId = req.auth.userId;
    const currentStoryId = req.body.currentStoryId;

    User.findOneAndUpdate(
        { _id: userId },
        { currentStoryId: currentStoryId },
        { new: true })
        .then((user) => res.status(200).json(user))
        .catch(error => res.status(400).json({ error: 'Not Found' }));
}

/*exports.addCompletedChapter = (req, res, next) => {
    const chapterId = req.body.chapterId;
    const userId = req.auth.userId;
    const nbQuestions = req.body.nbQuestions;

    User.findOne({ _id: userId })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Not Found' });
            }
            // add poiId to POIsCompleted if not already present
            if (!user.chaptersCompleted.includes(chapterId)) {
                user.chaptersCompleted.push(chapterId);
                user.coins += nbQuestions;
                user.save()
                    .then(() => res.status(200).json({ message: 'Chapter added to completed list' }))
                    .catch(error => res.status(400).json({ error: 'Not Found' }));
            }
            else {
                res.status(200).json({ message: 'Chapter already in completed list' });
            }
        })
        .catch(error => res.status(500).json({ error: 'Internal Error' }));
}*/

exports.loseLife = (req, res, next) => {
    const userId = req.auth.userId;

    User.findOne({ _id: userId })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Not Found' });
            }
            // decrease lifes by 1, but not below 0
            console.log("User lifes before losing life: " + user.lifes);
            if (user.lifes > 0) {
                user.lifes -= 1;
                user.save()
                    .then(() => res.status(200).json({ message: 'Life lost', lifes: user.lifes }))
                    .catch(error => res.status(400).json({ error: 'Not Found' }));
            }
            else {
                res.status(200).json({ message: 'No lifes left', lifes: user.lifes });
            }
        })
        .catch(error => res.status(500).json({ error: 'Internal Error' }));
}

exports.deleteUser = (req, res, next) => {
    let _id = req.params.id;
    User.findOne({ _id: _id })
        .then(user => {
            // delete user
            User.deleteOne({ _id: _id })
                .then(() => {
                    // delete 
                    X.deleteMany({ participants: _id })
                        .then(() => {
                            // TODO DELETE THE REST OF USER DATA (
                        })
                        .catch(error => res.status(400).json({ error: 'conversations not deleted' }));
                })
                .catch(error => res.status(400).json({ error: 'user not deleted' }));
        })
        .catch(error => res.status(400).json({ error: 'user not found' }));

}

// --- API : Récupérer le compte par catégorie (Optimisation) ---
exports.getDueMemoriesCount = (req, res) => {
    const userId = req.auth.userId;

    UserMemory.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId), // Important: caster en ObjectId pour l'agrégation
                dueDate: { $lte: new Date() }
            }
        },
        {
            $group: {
                _id: "$factType", // On groupe par type (flag, capital...)
                count: { $sum: 1 } // On compte
            }
        }
    ])
        .then(results => {
            // results ressemble à : [ { _id: 'flag', count: 5 }, { _id: 'capital', count: 2 } ]
            // On transforme en objet plus simple : { flag: 5, capital: 2 }
            const breakdown = {
                flag: 0,
                capital: 0,
                location: 0,
                anecdote: 0
            };

            results.forEach(r => {
                if (breakdown.hasOwnProperty(r._id)) {
                    breakdown[r._id] = r.count;
                }
            });

            res.status(200).json(breakdown);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error });
        });
};

// --- API : Récupérer les cartes (Mise à jour avec anecdote) ---
exports.getDueMemories = (req, res) => {
    const userId = req.auth.userId;
    const { geo, flag, capital, anecdote } = req.query;
    console.log("Getting due memories with filters - geo:", geo, "flag:", flag, "capital:", capital, "anecdote:", anecdote);

    const types = [];
    if (geo === 'true') types.push('location');
    if (flag === 'true') types.push('flag');
    if (capital === 'true') types.push('capital');
    if (anecdote === 'true') types.push('anecdote');

    UserMemory.find({
        userId: userId,
        dueDate: { $lte: new Date() },
        factType: { $in: types }
    })
        .limit(20)
        .then(memories => res.status(200).json(memories))
        .catch(error => res.status(500).json({ error }));
};

// --- API : Valider une révision (Algorithme SRS Simplifié) ---
exports.reviewMemory = (req, res) => {
    const { memoryId, isSuccess } = req.body;
    console.log(`Reviewing memory ${memoryId}, success: ${isSuccess}`);

    UserMemory.findById(memoryId)
        .then(memory => {
            if (!memory) return res.status(404).json({ error: 'Not found' });

            // ALGORITHME
            if (isSuccess) {
                // Succès : On augmente l'intervalle
                if (memory.repetition === 0) memory.interval = 1;
                else if (memory.repetition === 1) memory.interval = 3; // On espace un peu plus vite
                else memory.interval = Math.round(memory.interval * memory.easeFactor);

                memory.repetition += 1;
            } else {
                // Echec : Retour à la case départ (ou presque)
                memory.interval = 0; // A revoir tout de suite (ou demain)
                memory.repetition = 0;
            }

            // Calcul nouvelle date
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + memory.interval);

            memory.dueDate = nextDate;
            memory.lastReviewedAt = new Date();

            memory.save()
                .then(() => res.status(200).json({ message: 'Saved' }))
                .catch(err => res.status(500).json({ error: err }));
        })
        .catch(err => res.status(500).json({ error: err }));
};

// --- API: DASHBOARD COMPLET (Radar + Counts) ---
exports.getRevisionDashboardData = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const now = new Date();

        // 1. Récupérer TOUTES les mémoires de l'utilisateur
        // (C'est plus performant de tout récupérer (max ~800 items) et traiter en JS que de faire 15 agrégations complexes)
        const memories = await UserMemory.find({ userId: userId });

        // --- A. CALCUL DES COMPTEURS (Ce qui est dû MAINTENANT) ---
        const counts = {
            flag: 0,
            capital: 0,
            location: 0,
            anecdote: 0
        };

        // --- B. PRÉPARATION DES DONNÉES RADAR (Par Pays) ---
        // On regroupe les mémoires par code pays
        const countriesMap = {};

        // Liste des types autorisés pour le calcul du Radar
        const radarTypes = ['flag', 'capital', 'location'];

        memories.forEach(mem => {
            // 1. Mise à jour des compteurs "DUE"
            if (mem.dueDate <= now) {
                if (counts[mem.factType] !== undefined) {
                    counts[mem.factType]++;
                }
            }
            if (radarTypes.includes(mem.factType)) {
                // 2. Agrégation par Pays pour le Radar
                if (!countriesMap[mem.countryCode]) {
                    countriesMap[mem.countryCode] = {
                        totalInterval: 0,
                        itemCount: 0,
                        hasDueItems: false,
                        lastReviewed: mem.lastReviewedAt
                    };
                }

                const cData = countriesMap[mem.countryCode];

                // On accumule les intervalles (Jours)
                cData.totalInterval += mem.interval;
                cData.itemCount++;

                // Est-ce qu'il y a urgence sur ce pays ?
                if (mem.dueDate <= now) {
                    cData.hasDueItems = true;
                }

                // On garde la date la plus récente d'activité
                if (mem.lastReviewedAt > cData.lastReviewed) {
                    cData.lastReviewed = mem.lastReviewedAt;
                }
            }
        });

        // --- C. TRANSFORMATION EN LISTE RADAR ---
        let radarItems = Object.keys(countriesMap).map(code => {
            const data = countriesMap[code];

            // Calcul de la Moyenne d'intervalle pour ce pays
            const avgInterval = data.totalInterval / data.itemCount;

            // --- FORMULE DE MAÎTRISE ---
            // On considère qu'un intervalle moyen de 60 jours = 100% de maîtrise (Ancré)
            // On plafonne à 100.
            let mastery = Math.min(100, (avgInterval / 60) * 100);

            // Bonus : Si c'est tout nouveau (intervalle 0), on met 5% pour qu'il apparaisse au bord
            if (mastery < 5) mastery = 5;

            return {
                countryCode: code,
                masteryLevel: Math.round(mastery),
                isDue: data.hasDueItems,
                lastReviewed: data.lastReviewed
            };
        });

        // --- D. FILTRAGE ET TRI ---
        // On ne peut pas afficher 200 drapeaux sur le radar. On prend les 15 plus pertinents.
        // Critères : 
        // 1. Ceux qui sont "DUE" (Urgent)
        // 2. Ceux récemment révisés (Actifs)
        radarItems.sort((a, b) => {
            if (a.isDue && !b.isDue) return -1; // Priorité au rouge
            if (!a.isDue && b.isDue) return 1;
            return new Date(b.lastReviewed) - new Date(a.lastReviewed); // Puis les récents
        });

        // On garde le Top 20 pour le Radar
        const topRadarItems = radarItems.slice(0, 20);

        res.status(200).json({
            counts: counts,
            radarItems: topRadarItems
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ error: 'Impossible de charger le tableau de bord' });
    }
};

exports.getMuseumInventory = async (req, res) => {
    try {
        const userId = req.auth.userId;

        // 1. Récupérer l'utilisateur pour avoir sa liste d'IDs
        const user = await User.findById(userId).select('inventory');
        if (!user) return res.status(404).json({ error: 'User not found' });

        // 2. Récupérer TOUS les collectibles du jeu (La "Reference")
        // On trie par rareté ou par type si besoin
        const allCollectibles = await Collectible.find().lean();

        // 3. Fusionner : On ajoute un flag "isOwned" pour le front
        const museumData = allCollectibles.map(item => {
            const isOwned = user.inventory.includes(item.id);
            return {
                id: item.id,
                name: item.name,
                category: item.category,
                subCategory: item.subCategory,
                description: isOwned ? item.description : "???", // Mystère si pas possédé
                countryCode: item.countryCode,
                imageUri: item.imageUri,
                rarity: item.rarity,
                type: item.type,
                isOwned: isOwned
            };
        });

        // 4. On renvoie tout
        res.status(200).json(museumData);

    } catch (error) {
        console.error('Error fetching museum:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};


exports.getPilotLogbook = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // On récupère toutes les stories pour mapper les ID vers des Noms de Villes/Titres
        // Optimisation : On ne prend que les champs nécessaires
        const allStories = await Story.find().select('storyId city title countryCode isCapital');

        const logbook = [];

        // On itère sur le passeport (Map Mongoose)
        // user.passport est une Map : clé = countryCode ("FR"), valeur = objet entry
        for (const [code, entry] of user.passport) {

            // Trouver les détails des stories complétées par ce user dans ce pays
            const completedStoriesDetails = allStories.filter(s =>
                entry.storiesDone.includes(s.storyId)
            );

            // Extraire les villes uniques visitées
            const cities = [...new Set(completedStoriesDetails.map(s => s.city))];

            logbook.push({
                countryCode: code,
                visitDate: entry.lastVisitedAt,
                isCompleted: entry.isCompleted,
                storiesCount: entry.storiesDone.length,
                cities: cities, // Liste des villes explorées (ex: ["Paris", "Lyon"])
                hasFlag: entry.hasFlag
            });
        }

        // Tri : Les plus récents d'abord
        logbook.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));

        res.status(200).json(logbook);

    } catch (error) {
        console.error('Logbook Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};