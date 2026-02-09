// utils/textUtils.ts

// 1. Normalisation : Minuscule, sans accents, sans espaces, sans tirets
export const normalizeText = (text: string): string => {
    return text
        .normalize("NFD") // Sépare les accents (é -> e + ')
        .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ""); // Ne garde que lettres et chiffres
};

// 2. Calcul de distance (Levenshtein simple)
const getLevenshteinDistance = (a: string, b: string): number => {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // Substitution
                    matrix[i][j - 1] + 1,     // Insertion
                    matrix[i - 1][j] + 1      // Deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
};

// 3. Fonction principale de validation
export const isFuzzyMatch = (input: string, target: string): boolean => {
    const normInput = normalizeText(input);
    const normTarget = normalizeText(target);

    // Si l'input est trop court (ex: 1 ou 2 lettres), on exige une exactitude stricte
    // sinon "Fr" validerait "France" avec une tolérance trop large
    if (normTarget.length <= 3) {
        return normInput === normTarget;
    }

    // Calcul de la distance
    const distance = getLevenshteinDistance(normInput, normTarget);

    // On autorise 1 faute max
    return distance <= 1;
};