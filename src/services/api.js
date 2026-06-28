import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://news-backend-bffs.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const newsService = {
  getLatestNews: (limit = 20) => api.get(`/news/latest?limit=${limit}`),
  getTrendingNews: (keys, limit = 10) => api.get(`/news/trending?keys=${encodeURIComponent(keys)}&limit=${limit}`),
  getBreakingNews: (limit = 10) => api.get(`/news/breaking?limit=${limit}`),
  getNewsByCategory: (category, limit = 20) => api.get(`/news/category/${encodeURIComponent(category)}?limit=${limit}`),
  getArticleBySlug: (slug) => api.get(`/news/${encodeURIComponent(slug)}`),
  searchNews: (query) => api.get(`/news/trending?keys=${encodeURIComponent(query)}&limit=20`),
};

export const weatherService = {
  getWeather: async (lat, lon, location = {}) => {
    try {
      const params = new URLSearchParams();
      if (Number.isFinite(lat)) params.set('lat', lat);
      if (Number.isFinite(lon)) params.set('lon', lon);
      if (location.city) params.set('city', location.city);
      if (location.country) params.set('country', location.country);
      if (location.label) params.set('label', location.label);

      const query = params.toString();
      const response = await api.get(`/weather${query ? `?${query}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Weather API error:', error);
      return null;
    }
  },
  getLocationByIp: async () => {
    try {
      const response = await axios.get('https://ipwho.is/');
      if (!response.data?.success) return null;

      const city = response.data.city;
      const country = response.data.country;

      return {
        latitude: Number(response.data.latitude),
        longitude: Number(response.data.longitude),
        city,
        country,
        label: [city, country].filter(Boolean).join(', '),
      };
    } catch (error) {
      console.error('IP location error:', error);
      return null;
    }
  },
};

export const marketService = {
  getMarketData: async () => {
    try {
      const response = await api.get('/market');
      return response.data;
    } catch (error) {
      console.error('Market API error:', error);
      return null;
    }
  },
};

export const contactService = {
  sendMessage: (payload) => api.post('/contact', payload),
};

export default api;
