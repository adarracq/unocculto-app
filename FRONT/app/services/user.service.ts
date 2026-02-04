import User from "../models/User";
import { fetchWrapper } from "../utils/FetchWrapper";

const baseUrl = process.env.EXPO_PUBLIC_API_URL + '/api/user';

// Interfaces for service parameters
interface LoginOrSignupParams {
    email: string;
    language?: string;
}

interface VerifyEmailCodeParams {
    email: string;
    code: string;
}


interface ExpoPushTokenParams {
    token: string;
    email: string;
}

export interface MemoryCount {
    flag: number;
    capital: number;
    location: number;
    anecdote: number;
}

// NOUVELLE Interface pour le Radar
export interface RadarItem {
    countryCode: string;
    masteryLevel: number; // 0 (Oublié/Nouveau) à 100 (Maîtrisé/Ancré)
    isDue: boolean;       // Si vrai, le drapeau clignote ou est rouge
}

// On combine pour le Dashboard complet
export interface RevisionDashboardData {
    counts: MemoryCount;
    radarItems: RadarItem[]; // Top 10-15 pays les plus pertinents à afficher
}

export const userService = {
    loginOrSignup,
    verifyEmailCode,
    getByEmail,
    getById,
    update,
    updateCurrentStoryId,
    testPseudoValidity,
    completeStory,
    addCompletedChapter,
    loseLife,
    saveExpoPushToken,
    deleteAccountAndData,
    getDueMemories,
    getDueMemoriesCount,
    getRevisionDashboardData,
    reviewMemory,
    getMuseumInventory,
    getPilotLogbook
};

function loginOrSignup(params: LoginOrSignupParams) {
    return fetchWrapper.post(baseUrl + '/loginOrSignup', params);
}

function verifyEmailCode(params: VerifyEmailCodeParams) {
    return fetchWrapper.post(baseUrl + '/code', params);
}

function getByEmail(email: string) {
    return fetchWrapper.get(baseUrl + '/' + email);
}

function getById(id: string) {
    return fetchWrapper.get(`${baseUrl}/id/${id}`);
}

function update(params: User) {
    return fetchWrapper.put(baseUrl + '/', params);
}

function updateCurrentStoryId(storyId: string) {
    return fetchWrapper.put(baseUrl + '/currentStoryId', { currentStoryId: storyId });
}

function testPseudoValidity(pseudo: string) {
    return fetchWrapper.get(baseUrl + '/verifyPseudo/' + pseudo);
}

function completeStory(data: { storyId: string; countryCode: string; score: number }) {
    return fetchWrapper.post(baseUrl + '/completeStory', data);
}

function addCompletedChapter(chapterId: string, nbQuestions: number) {
    return fetchWrapper.post(baseUrl + '/chapter', { chapterId, nbQuestions });
}

function loseLife() {
    return fetchWrapper.post(baseUrl + '/loseLife', {});
}

function saveExpoPushToken(params: ExpoPushTokenParams) {
    return fetchWrapper.put(baseUrl + '/expoPushToken', params);
}

function deleteAccountAndData(id: string) {
    return fetchWrapper.delete(`${baseUrl}/${id}`);
}

function getDueMemoriesCount() {
    return fetchWrapper.get(baseUrl + '/memories/count');
}

function getDueMemories(filters?: any) {
    const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return fetchWrapper.get(baseUrl + '/memories/due' + query);
}

function reviewMemory(memoryId: string, isSuccess: boolean) {
    return fetchWrapper.post(baseUrl + '/memories/review', { memoryId, isSuccess });
}

function getRevisionDashboardData() {
    // On appelle un endpoint unifié pour éviter de faire 2 appels
    return fetchWrapper.get(baseUrl + '/revisions/dashboard');
}

function getMuseumInventory() {
    return fetchWrapper.get(baseUrl + '/inventory/museum');
}

function getPilotLogbook() {
    return fetchWrapper.get(baseUrl + '/museum/logbook');
}