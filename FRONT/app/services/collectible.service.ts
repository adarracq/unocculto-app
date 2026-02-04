import { fetchWrapper } from "../utils/FetchWrapper";

const baseUrl = process.env.EXPO_PUBLIC_API_URL + '/api/collectible';

export const collectibleService = {
    getById,
};

function getById(collectibleId: string) {
    return fetchWrapper.get(baseUrl + `/${collectibleId}`);
}