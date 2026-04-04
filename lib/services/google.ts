import axios from "axios";

const placesClient = axios.create({
    baseURL: 'https://places.googleapis.com/v1/places',
    headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': 'AIzaSyDVg1KdYVy-BatJedvC3JXN5z8X1mRjcEw',
    },
});

const googleApi = {
    getAutocomplete: async (query: string) => {
        const data = {
            input: query,
            regionCode: 'at',
        }
        const response = await placesClient.post(':autocomplete', data);

        if (response.status !== 200) {
            throw new Error('Failed to get autocomplete');
        }
        return response.data;
    },
    getPlaces: async (query: string) => {
        const response = await placesClient.get('/autocomplete/json', {
            params: {
                input: query,
                types: 'geocode',
            },
        });
        return response.data;
    },
};

export default googleApi;
