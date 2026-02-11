import { fetchWrapper } from "../utils/FetchWrapper";

const baseUrl = process.env.EXPO_PUBLIC_API_URL + '/api/story';

export const storyService = {
    getById,
    getAvailableDestinations,
};

function getById(id: string) {
    return fetchWrapper.get(`${baseUrl}/id/${id}`);
}

function getAvailableDestinations() {
    return fetchWrapper.get(baseUrl + '/available/destinations');
}
