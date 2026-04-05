// Register at https://unsplash.com/developers to get a free Access Key.
// This will be moved to an EAS Secret environment variable in Phase 1h.
const UNSPLASH_ACCESS_KEY = "rZdiOASNYWjuwUMqOgmpZ9RzWyFUOViV7HP11m-3d30";

export type UnsplashPhoto = {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
};

export const unsplashService = {
  searchCityPhoto: async (
    query: string,
    page = 1,
  ): Promise<UnsplashPhoto | null> => {
    if (!UNSPLASH_ACCESS_KEY) return null;

    try {
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&page=${page}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;
      const response = await fetch(url);
      if (!response.ok) return null;
      const data = await response.json();
      return data.results?.[0] ?? null;
    } catch {
      return null;
    }
  },
};
