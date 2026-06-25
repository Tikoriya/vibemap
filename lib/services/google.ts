import axios from "axios";

const API_KEY = 'AIzaSyDVg1KdYVy-BatJedvC3JXN5z8X1mRjcEw';

const placesClient = axios.create({
    baseURL: 'https://places.googleapis.com/v1/places',
    headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
    },
});

export type PlaceDetail = {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
};

const googleApi = {
    getAutocomplete: async (query: string) => {
        const response = await placesClient.post(':autocomplete', { input: query });
        if (response.status !== 200) {
            throw new Error('Failed to get autocomplete suggestions');
        }
        return response.data;
    },

    getPlaceDetails: async (placeId: string): Promise<PlaceDetail> => {
        const response = await placesClient.get(`/${placeId}`, {
            headers: {
                'X-Goog-FieldMask': 'displayName,formattedAddress,location',
            },
        });
        const { displayName, formattedAddress, location } = response.data;
        return {
            name: displayName?.text ?? '',
            address: formattedAddress ?? '',
            latitude: location?.latitude ?? 0,
            longitude: location?.longitude ?? 0,
        };
    },

    // Best-effort resolution of a country from a city name, used to pre-fill the
    // country field when creating a city. Returns null on any failure.
    getCountryForCity: async (city: string): Promise<string | null> => {
        try {
            const response = await placesClient.post(
                ':searchText',
                { textQuery: city, includedType: 'locality' },
                { headers: { 'X-Goog-FieldMask': 'places.addressComponents' } },
            );
            const place = response.data?.places?.[0];
            const country = place?.addressComponents?.find(
                (component: { types?: string[] }) =>
                    Array.isArray(component.types) && component.types.includes('country'),
            );
            return country?.longText ?? null;
        } catch {
            return null;
        }
    },
};

export default googleApi;
