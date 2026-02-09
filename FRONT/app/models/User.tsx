// app/models/User.ts

export interface LevelProgress {
    unlocked: boolean;
    completed: boolean;
    bestScore: number;     // Défaut: 0
    bestTime: number | null;
    stars: 0 | 1 | 2 | 3;
}

export interface RegionProgress {
    // Clé dynamique : 'country' | 'flag' | 'capital'
    [modeId: string]: {
        // Clé dynamique : '1' | '2' | '3' | '4'
        levels: Record<number, LevelProgress>;
    }
}

export interface UserLicenseProgress {
    // Clé dynamique : 'EUR', 'ASI', 'AFR'...
    [regionCode: string]: RegionProgress;
}

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
    selectedFlag: string | null;

    passport: Record<string, PassportEntry>;
    progression: UserLicenseProgress; // <-- Notre nouvelle structure

    inventory: string[];
    fuel: number;
    xp: number;
    dayStreak: number;
    isPremium: boolean;
    storiesPlayedCount: number;
    lastStoryPlayedAt: string | null;
    currentStoryId: string | null;
    expoPushToken: string | null;
    code: string | null;

    constructor(email: string) {
        this.email = email;
        this._id = null;
        this.pseudo = null;
        this.selectedFlag = null;
        this.passport = {};
        this.progression = {}; // Initialisation vide
        this.inventory = [];
        this.fuel = 10;
        this.xp = 0;
        this.dayStreak = 0;
        this.currentStoryId = null;
        this.isPremium = false;
        this.storiesPlayedCount = 0;
        this.lastStoryPlayedAt = null;
        this.expoPushToken = null;
        this.code = null;
    }

    // Helpers existants...
    getUnlockedFlags(): string[] {
        return Object.keys(this.passport).filter(code => this.passport[code].hasFlag);
    }

    hasCompletedGame(regionCode: string, modeId: string, level: number): boolean {
        return !!this.progression[regionCode]?.[modeId]?.levels[level]?.completed;
    }
}