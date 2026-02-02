const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Story = require('../models/Story');
const sendEmail = require("../scripts/email");

exports.loginOrSignup = (req, res, next) => {

    const email = req.body.email;
    // create a 6 digits random code
    let code = Math.floor(100000 + Math.random() * 900000);

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
        // On vérifie si la clé 'FR', 'JP'... existe dans la Map
        if (!user.passport.has(countryCode)) {
            user.passport.set(countryCode, {
                hasFlag: false, // On va le mettre à true juste après
                isCompleted: false,
                storiesDone: [],
                lastVisitedAt: new Date()
            });
        }

        // On récupère l'objet mutable pour ce pays
        const countryEntry = user.passport.get(countryCode);

        // --- 2. GESTION DU DRAPEAU (Dès la 1ère visite) ---
        let flagUnlocked = false;
        if (!countryEntry.hasFlag) {
            countryEntry.hasFlag = true;
            flagUnlocked = true; // Signal pour le Frontend
        }

        // --- 3. HISTORIQUE & RÉCOMPENSES ---

        // Est-ce un Replay ?
        const alreadyPlayed = countryEntry.storiesDone.includes(storyId);

        // Ajout de la story si nouvelle
        if (!alreadyPlayed) {
            countryEntry.storiesDone.push(storyId);
        }

        // Mise à jour date visite
        countryEntry.lastVisitedAt = new Date();

        // Calcul XP (Divisé par 2 si replay)
        const xpEarned = alreadyPlayed ? Math.floor(story.xpReward / 2) : story.xpReward;

        // Collectible (Si existe et pas déjà dans l'inventaire global)
        let newCollectible = null;
        if (!alreadyPlayed && story.rewardCollectibleId) {
            if (!user.inventory.includes(story.rewardCollectibleId)) {
                user.inventory.push(story.rewardCollectibleId);
                newCollectible = story.rewardCollectibleId;
            }
        }

        // --- 4. VÉRIFICATION 100% (Badge Or) ---
        let countryCompleted = false;

        // On ne vérifie que si le pays n'est pas déjà marqué comme complété
        if (!countryEntry.isCompleted) {
            const totalStories = await Story.countDocuments({ countryCode: countryCode });

            if (countryEntry.storiesDone.length >= totalStories) {
                countryEntry.isCompleted = true;
                countryCompleted = true; // Signal pour le Frontend
            }
        }

        // --- 5. SAUVEGARDE ---
        // Important avec les Maps Mongoose : confirmer la modif
        user.passport.set(countryCode, countryEntry);

        // On vide currentStoryId car le voyage est fini
        user.currentStoryId = null;

        await user.save();

        // --- 6. RÉPONSE ---
        // On renvoie le passport converti en objet standard JS pour le front
        res.status(200).json({
            success: true,
            earned: {
                xp: xpEarned,
                collectible: newCollectible
            },
            flagUnlocked: flagUnlocked,
            countryCompleted: countryCompleted,
            updatedUser: {
                // Le front recevra un objet : { "FR": { hasFlag: true... }, "JP": {...} }
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