import { unsplashAccessKey } from "@/lib/env";

export type UnsplashPhoto = {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
};

const LOG_PREFIX = "[unsplash]";

export const unsplashService = {
  // Returns null when the search simply has no results; throws on a real
  // network/API failure so callers can surface a retryable error to the user.
  searchCityPhoto: async (
    query: string,
    page = 1,
  ): Promise<UnsplashPhoto | null> => {
    if (!unsplashAccessKey) {
      console.error(`${LOG_PREFIX} missing access key`);
      throw new Error("Photo service is not configured.");
    }

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&page=${page}&orientation=landscape&client_id=${unsplashAccessKey}`;

    console.log(`${LOG_PREFIX} request`, { query, page });

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const body = await response.text().catch(() => "<unreadable body>");
        console.error(`${LOG_PREFIX} request failed`, {
          query,
          page,
          status: response.status,
          statusText: response.statusText,
          body,
        });
        throw new Error("Could not load a photo. Please try again.");
      }

      const data = await response.json();
      const photo = data.results?.[0] ?? null;
      console.log(`${LOG_PREFIX} response`, {
        query,
        page,
        total: data.total,
        found: !!photo,
      });
      return photo;
    } catch (error) {
      console.error(`${LOG_PREFIX} error`, { query, page, error });
      throw error;
    }
  },
};
