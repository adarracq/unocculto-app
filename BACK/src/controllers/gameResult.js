const mongoose = require('mongoose');
const User = require('../models/User');
const GameResult = require('../models/GameResult');


exports.finishGame = async (req, res) => {
    try {
        const { mode, region, lvl, timeTaken, accuracy, score } = req.body;
        const userId = req.auth.userId;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // 2. Sauvegarde Historique (GameResult)
        const newResult = new GameResult({
            userId,
            pseudo: user.pseudo,
            selectedFlag: user.selectedFlag,
            mode, region, lvl,
            score, timeTaken, accuracy,
            xpEarned: score,
        });
        await newResult.save();

        // 3. MISE À JOUR PROGRESSION (Correction Map Mongoose)

        // A. On récupère l'objet de la région via .get() (ou objet vide)
        // Important : On travaille sur une copie "POJO" (Plain Object) pour manipuler tranquillement
        let regionData = user.progression.get(region) || {};

        // On s'assure que la structure existe
        if (!regionData[mode]) regionData[mode] = { levels: {} };
        if (!regionData[mode].levels) regionData[mode].levels = {};

        // B. Récupérer le niveau actuel
        // On définit les valeurs par défaut si le niveau n'existe pas encore
        const currentLevelData = regionData[mode].levels[lvl] || {
            unlocked: true,
            completed: false,
            bestAccuracy: 0,
            bestTime: null
        };

        // C. LOGIQUE DE COMPARAISON (Accuracy > Temps)
        let isNewRecord = false;

        // Cas 1 : Meilleure Précision qu'avant
        if (accuracy > (currentLevelData.bestAccuracy || 0)) {
            isNewRecord = true;
        }
        // Cas 2 : Même Précision, mais Meilleur Temps (ou pas de temps enregistré)
        else if (accuracy === (currentLevelData.bestAccuracy || 0)) {
            if (currentLevelData.bestTime === null || timeTaken < currentLevelData.bestTime) {
                isNewRecord = true;
            }
        }

        // Application des mises à jour
        currentLevelData.completed = true; // Toujours validé si finishGame est appelé

        if (isNewRecord) {
            currentLevelData.bestAccuracy = accuracy;
            currentLevelData.bestTime = timeTaken;
            // On peut garder bestScore pour l'affichage si tu veux, sinon on l'enlève
            currentLevelData.bestScore = score;
        }

        // On remet l'objet mis à jour dans la structure locale
        regionData[mode].levels[lvl] = currentLevelData;

        // D. DÉVERROUILLER LE NIVEAU SUIVANT
        const nextLvl = parseInt(lvl) + 1;
        const nextLevelData = regionData[mode].levels[nextLvl] || {
            unlocked: false, completed: false, bestAccuracy: 0, bestTime: null
        };

        if (!nextLevelData.unlocked) {
            nextLevelData.unlocked = true;
            regionData[mode].levels[nextLvl] = nextLevelData;
        }

        // E. SAUVEGARDE CRITIQUE (Set + MarkModified)
        // 1. On réinsère l'objet modifié dans la Map Mongoose
        user.progression.set(region, regionData);

        // 2. On signale explicitement que 'progression' a changé (Indispensable pour Mixed/Map deep changes)
        user.markModified('progression');

        user.xp += score;
        user.fuel = Math.max(0, user.fuel - 1);

        await user.save();

        console.log(`Progression saved for ${user.pseudo}:`, currentLevelData);

        res.json({ success: true, score, newBest: isNewRecord });

    } catch (error) {
        console.error("Finish Game Error:", error);
        res.status(500).json({ error: 'Cannot save game result' });
    }
};

// Récupérer le TOP 20 pour un Niveau spécifique (Tri: Précision > Temps)
exports.getLeaderboard = async (req, res) => {
    const { mode, region, lvl } = req.params;

    const leaderboard = await GameResult.aggregate([
        // 1. Filtrer les bons jeux
        { $match: { mode, region, lvl: parseInt(lvl) } },

        // 2. Trier TOUS les résultats pour mettre le "Meilleur Run" de chaque joueur en haut de pile
        // CRITÈRE : D'abord la précision (Desc), ensuite le temps (Asc) pour départager
        { $sort: { accuracy: -1, timeTaken: 1 } },

        // 3. Grouper par User
        // On utilise $first partout pour conserver l'intégrité du run (le score et le temps correspondent bien à la précision)
        {
            $group: {
                _id: "$userId",
                pseudo: { $first: "$pseudo" },
                flag: { $first: "$selectedFlag" },

                // On capture les stats de CE run spécifique (le meilleur)
                bestScore: { $first: "$score" }, // On garde le score pour info, même si on trie par acc/time
                accuracy: { $first: "$accuracy" },
                timeTaken: { $first: "$timeTaken" },
                date: { $first: "$playedAt" }
            }
        },

        // 4. Trier le classement final (Même logique : Précision > Temps)
        { $sort: { accuracy: -1, timeTaken: 1 } },

        // 5. Prendre le Top 20
        { $limit: 20 }
    ]);

    res.json(leaderboard);
};
exports.getHebdoLeaderBoard = async (req, res) => {
    try {
        const userId = req.auth.userId; // Ou req.params.userId selon ta route
        const now = new Date();

        // 1. Définir le début de la semaine (Lundi matin 00:00)
        // Note: Gestion basique du timezone serveur
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay(); // 0 (Dim) - 6 (Sam)
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Ajuster au Lundi
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        // 2. Pipeline d'Agrégation
        const pipeline = [
            // A. Filtrer les parties de la semaine uniquement
            {
                $match: {
                    playedAt: { $gte: startOfWeek }
                }
            },
            // B. Grouper par Joueur et sommer l'XP
            {
                $group: {
                    _id: "$userId",
                    pseudo: { $first: "$pseudo" }, // On prend le dernier pseudo connu
                    flag: { $first: "$selectedFlag" },
                    totalXp: { $sum: "$xpEarned" },
                    gamesPlayed: { $sum: 1 } // Stat bonus sympa
                }
            },
            // C. Trier par XP décroissant
            { $sort: { totalXp: -1 } },
            // D. Ajouter le rang (index + 1)
            {
                $setWindowFields: {
                    sortBy: { totalXp: -1 },
                    output: {
                        rank: { $rank: {} }
                    }
                }
            },
            // E. Facettes (Pour récupérer à la fois le Top et le User)
            {
                $facet: {
                    // Le Podium (Top 5)
                    "topLeaderboard": [
                        { $limit: 5 }
                    ],
                    // La position du joueur
                    "userRank": [
                        { $match: { _id: new mongoose.Types.ObjectId(userId) } }
                    ]
                }
            }
        ];

        const results = await GameResult.aggregate(pipeline);
        const data = results[0];
        // 3. Construction de la réponse propre
        const topList = data.topLeaderboard.map(entry => ({
            rank: entry.rank,
            pseudo: entry.pseudo || "Joueur",
            score: entry.totalXp, // On affiche l'XP
            isUser: entry._id.toString() === userId,
            flag: entry.flag || null
        }));

        let userEntry = null;
        if (data.userRank.length > 0) {
            const u = data.userRank[0];
            userEntry = {
                rank: u.rank,
                pseudo: u.pseudo,
                score: u.totalXp,
                isUser: true,
                flag: u.flag
            };
        } else {
            // Si le joueur n'a pas encore joué cette semaine
            const currentUser = await User.findById(userId).select('pseudo flag');
            userEntry = {
                rank: 0, // Non classé
                pseudo: currentUser ? currentUser.pseudo : "Moi",
                score: 0,
                isUser: true,
                flag: currentUser ? currentUser.flag : null
            };
        }

        // Astuce UI : Si le User n'est pas dans le Top 5, on l'ajoute à la liste pour l'affichage
        // (Sauf si rank 0)
        let finalDisplayList = [...topList];
        const isUserInTop = topList.some(i => i.isUser);

        if (!isUserInTop && userEntry.rank !== 0) {
            // On peut ajouter un séparateur visuel côté front, ou juste l'ajouter à la fin
            finalDisplayList.push(userEntry);
        }

        res.status(200).json({
            weekStart: startOfWeek,
            leaderboard: finalDisplayList,
            userStats: userEntry
        });

    } catch (error) {
        console.error("Leaderboard Error:", error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};