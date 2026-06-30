import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography
} from '@mui/material';
import { newsService, weatherService, marketService } from '../services/api';
import SEO from '../components/SEO';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  SITE_URL,
  getCanonicalUrl,
  toTitleCase,
} from '../utils/seo';

// Importing all our refactored components
import MarketTicker from '../components/MarketTicker';
import BreakingNews from '../components/BreakingNews';
import WeatherWidget from '../components/WeatherWidget';
import MarketWidget from '../components/MarketWidget';
import FeaturedNews from '../components/FeaturedNews';
import TrendingSection from '../components/TrendingSection';
import Categories from '../components/Categories';
import TagFilter from '../components/TagFilter';
import NewsGrid from '../components/NewsGrid';

import './HomePage.css'; 

const HomePage = () => {
  const navigate = useNavigate();
  const { category: categoryParam } = useParams();
  const [latestNews, setLatestNews] = useState([]);
  const [topNews, setTopNews] = useState([]);
  const [breakingNews, setBreakingNews] = useState([]);
  const [weather, setWeather] = useState(null);
  const [weatherLocation, setWeatherLocation] = useState('Detecting city');
  const [marketData, setMarketData] = useState(null);
  
  // Filtering States
  const [selectedTags, setSelectedTags] = useState([]);
  const [activeCategory, setActiveCategory] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveCategory(categoryParam || 'home');
  }, [categoryParam]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    navigate(category === 'home' ? '/' : `/category/${category}`);
  };

  const fetchData = useCallback(async () => {
    try {
      const breakingRes = await newsService.getBreakingNews(10);
      setBreakingNews(breakingRes.data.items || []);
    } catch (error) {
      console.error('Error fetching breaking news:', error);
    }

    try {
      const trendingRes = await newsService.getTrendingNews('breaking,top,trending', 6);
      setTopNews(trendingRes.data.items || []);
    } catch (error) {
      console.error('Error fetching trending news:', error);
    }
  }, []);

  const fetchCategoryNews = useCallback(async (category) => {
    setLoading(true);
    setSelectedTags([]);

    try {
      const response = category === 'home'
        ? await newsService.getLatestNews(20)
        : await newsService.getNewsByCategory(category, 20);

      setLatestNews(response.data.items || []);
    } catch (error) {
      console.error('Error fetching category news:', error);
      setLatestNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMarketData = useCallback(async () => {
    try {
      const data = await marketService.getMarketData();
      setMarketData(data);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  }, []);

  const loadWeatherForIpLocation = useCallback(async () => {
    const ipLocation = await weatherService.getLocationByIp();
    if (Number.isFinite(ipLocation?.latitude) && Number.isFinite(ipLocation?.longitude)) {
      const weatherRes = await weatherService.getWeather(
        ipLocation.latitude,
        ipLocation.longitude,
        ipLocation
      );
      setWeather(weatherRes);
      setWeatherLocation(weatherRes?.location?.label || ipLocation.label || 'Current City');
      return;
    }

    const weatherRes = await weatherService.getWeather(28.6139, 77.2090, {
      city: 'New Delhi',
      country: 'India',
      label: 'New Delhi, India',
    });
    setWeather(weatherRes);
    setWeatherLocation(weatherRes?.location?.label || 'New Delhi, India');
  }, []);

  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const weatherRes = await weatherService.getWeather(
              latitude,
              longitude
            );
            setWeather(weatherRes);
            setWeatherLocation(weatherRes?.location?.label || 'Current Location');
          } catch (error) {
            console.error('Error fetching weather:', error);
            loadWeatherForIpLocation();
          }
        },
        () => loadWeatherForIpLocation()
      );
    } else {
      loadWeatherForIpLocation();
    }
    fetchMarketData();
  }, [fetchMarketData, loadWeatherForIpLocation]);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  useEffect(() => {
    const loadNews = async () => {
      await fetchCategoryNews(activeCategory);
      fetchData();
    };

    loadNews();
  }, [activeCategory, fetchCategoryNews, fetchData]);

  const handleTagFilter = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Keep tag filtering local to the selected category result set.
  const filteredNews = latestNews.filter(article => {
    const matchesTags = selectedTags.length === 0 || article.tags?.some(tag => selectedTags.includes(tag));
    return matchesTags;
  });

  const allTags = [...new Set(latestNews.flatMap(article => article.tags || []))];
  const isCategoryPage = activeCategory !== 'home';
  const categoryName = isCategoryPage ? toTitleCase(activeCategory) : '';
  const pageTitle = isCategoryPage
    ? `${categoryName} News | ${SITE_NAME}`
    : `Latest Breaking News | ${SITE_NAME}`;
  const pageDescription = isCategoryPage
    ? `Latest ${categoryName} news and updates.`
    : DEFAULT_DESCRIPTION;
  const canonicalPath = isCategoryPage ? `/category/${activeCategory}` : '/';
  const homeSchemas = isCategoryPage
    ? [{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: pageTitle,
        description: pageDescription,
        url: getCanonicalUrl(canonicalPath),
        isPartOf: {
          '@type': 'WebSite',
          name: SITE_NAME,
          url: SITE_URL,
        },
      }]
    : [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: SITE_URL,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE_URL}/?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: `${SITE_URL}/GS.png`,
        },
      ];

  return (
    <Box className="homepage-wrapper">
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonicalPath={canonicalPath}
        keywords={isCategoryPage ? [categoryName, `${categoryName} news`, ...DEFAULT_KEYWORDS] : DEFAULT_KEYWORDS}
        jsonLd={homeSchemas}
      />
      
      {/* 1. Market Ticker (Replaces inline top bar) */}
      <MarketTicker marketData={marketData} weatherData={weather} weatherLocation={weatherLocation} />

      <Container maxWidth="xl" className="breaking-container">
        {/* 2. Breaking News Ticker */}
        {breakingNews.length > 0 && (
          <BreakingNews news={breakingNews} />
        )}
      </Container>

      {/* Hero Section */}
      <Box className="hero-section">
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" className="hero-title">
            Stay Informed with Latest News
          </Typography>
          <Typography variant="h5" className="hero-subtitle">
            Get the latest updates on what matters to you
          </Typography>
        </Container>
      </Box>

      {/* Widgets Section */}
      <Container maxWidth="lg" className="widgets-container">
        <Box className="widgets-grid">
          <Box>
            <WeatherWidget weather={weather} location={weatherLocation} />
          </Box>
          <Box>
            <MarketWidget marketData={marketData} />
          </Box>
        </Box>
      </Container>

      {/* Main Content */}
      <Container maxWidth="lg" className="main-content-container">
        
        {/* 3. Featured News (Highlighting the biggest stories) */}
        <Box component="section" className="content-section">
          <Typography variant="h4" className="section-title">
            Featured Stories
          </Typography>
          <FeaturedNews news={topNews.slice(0, 3)} />
        </Box>

        {/* 4. Trending Section (The 5-column fire grid) */}
        <Box component="section" className="content-section">
          <TrendingSection news={topNews} />
        </Box>

        {/* 5. Categories Browser */}
        <Box component="section" className="content-section compact-section">
          <Categories 
            activeCategory={activeCategory} 
            onCategoryChange={handleCategoryChange} 
          />
        </Box>

        {/* 6. Tag Filter */}
        <Box component="section" className="content-section compact-section">
          <Typography variant="h5" className="section-subtitle">
            Filter by Tags
          </Typography>
          <TagFilter 
            tags={allTags} 
            selectedTags={selectedTags} 
            onTagSelect={handleTagFilter} 
          />
        </Box>

        {/* 7. Latest News Grid (Replaces inline mapping) */}
        <Box component="section">
          <Typography variant="h4" className="section-title">
            {activeCategory !== 'home' ? `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} News` : 'Latest News'}
          </Typography>
          
          <NewsGrid news={filteredNews} loading={loading} />
          
        </Box>

      </Container>
    </Box>
  );
};

export default HomePage;
