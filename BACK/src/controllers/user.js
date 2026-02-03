const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Story = require('../models/Story');
const sendEmail = require("../scripts/email");
const mongoose = require('mongoose');
const UserMemory = require('../models/UserMemory');

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

        // --- 5. SAUVEGARDE ---
        user.passport.set(countryCode, countryEntry);
        user.currentStoryId = null;
        await user.save();

        // --- 6. GESTION DES SOUVENIRS UTILISATEUR (SRS) ---
        // C'est ici qu'on initialise les cartes de révision pour ce pays
        if (!alreadyPlayed) {
            const memoriesToCreate = [
                { userId, countryCode, factType: 'flag' },
                { userId, countryCode, factType: 'capital' },
                { userId, countryCode, factType: 'location' },
                // ✅ AJOUT : On crée aussi la mémoire "Anecdote" pour le filtre Culture
                { userId, countryCode, factType: 'anecdote' }
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
                coins: user.coins,
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