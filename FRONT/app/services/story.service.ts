import Theme from "../models/Theme";
import { fetchWrapper } from "../utils/FetchWrapper";

const baseUrl = process.env.EXPO_PUBLIC_API_URL + '/api/story';

export const storyService = {
    getById,
    getNextByCountryCode,
    getAvailableDestinations,
    create
};

function getById(id: string) {
    return fetchWrapper.get(`${baseUrl}/id/${id}`);
}

function getNextByCountryCode(countryCode: string) {
    return fetchWrapper.get(`${baseUrl}/next/${countryCode}`);
}

function getAvailableDestinations() {
    return fetchWrapper.get(baseUrl + '/available/destinations');
}

function create(params: Theme) {
    return fetchWrapper.post(baseUrl + '/', params);
}
