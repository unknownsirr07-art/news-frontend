import React from 'react';
import { Box } from '@mui/material';
import NewsCard from './NewsCard';
import './FeaturedNews.css'; // Pure CSS for layout animations

const FeaturedNews = ({ news }) => {
  if (!news?.length) return null;

  return (
    <Box className="featured-news-wrapper">
      <Box className="featured-news-layout">
        <Box className="featured-main-col">
          <NewsCard article={news[0]} variant="featured" />
        </Box>
      </Box>
    </Box>
  );
};

export default FeaturedNews;
