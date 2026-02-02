// app/models/User.ts

export interface PassportEntry {
    hasFlag: boolean;
    isCompleted: boolean;
    storiesDone: string[];
    lastVisitedAt: string;
}

export default class User {
    _id: string | null;
    email: string;
    pseudo: string | null;

    // Cosmétique : Uniquement le drapeau maintenant
    selectedFlag: string | null;

    // LE PASSEPORT (Map)
    passport: Record<string, PassportEntry>;

    // Inventaire global (Objets, Souvenirs...)
    inventory: string[];

    // Économie & Progression
    coins: number;
    energy: number;
    dayStreak: number;
    currentStoryId: string | null;

    // Logs
    expoPushToken: string | null;
    code: string | null;


    constructor(email: string) {
        this.email = email;
        this._id = null;
        this.pseudo = null;

        this.selectedFlag = null;

        this.passport = {};
        this.inventory = [];

        this.coins = 0;
        this.energy = 10;
        this.dayStreak = 0;
        this.currentStoryId = null;
        this.expoPushToken = null;
        this.code = null;
    }

    // --- HELPER METHODS ---

    getUnlockedFlags(): string[] {
        return Object.keys(this.passport).filter(code => this.passport[code].hasFlag);
    }

    getCompletedCountries(): string[] {
        return Object.keys(this.passport).filter(code => this.passport[code].isCompleted);
    }

    isCountryCompleted(code: string): boolean {
        return !!this.passport[code]?.isCompleted;
    }
}