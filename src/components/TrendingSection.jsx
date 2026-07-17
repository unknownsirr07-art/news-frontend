import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { getArticleImage } from '../utils/seo';
import './TrendingSection.css';

const TrendingSection = ({ news }) => {
  const trendingNews = news?.slice(0, 5) || [];

  return (
    <Box component="section" className="trending-section">
      
      {/* Header */}
      <Box className="trending-header">
        <LocalFireDepartmentIcon className="trending-fire-icon" />
        <Typography variant="h4" component="h2" className="trending-title">
          <span className="gradient-text">Trending</span> Now
        </Typography>
      </Box>
      
      {/* 5-Column Grid */}
      <Box className="trending-grid">
        {trendingNews.map((article, index) => (
          <Box
            component={RouterLink}
            key={article.article_id}
            to={`/article/${article.slug}`}
            className="trending-card"
          >
            <Box className="trending-image-wrap">
              <img src={getArticleImage(article)} alt="" className="trending-image" loading="lazy" decoding="async" />
            </Box>
            {/* Rank Number & Decorative Line */}
            <Box className="trending-rank-container">
              <Typography variant="h4" className="trending-rank">
                {String(index + 1).padStart(2, '0')}
              </Typography>
              <Box className="trending-line" />
            </Box>
            
            {/* Content */}
            <Typography variant="subtitle1" component="h3" className="trending-headline">
              {article.headline}
            </Typography>
            <Typography variant="body2" className="trending-deck">
              {article.deck}
            </Typography>
          </Box>
        ))}
      </Box>

    </Box>
  );
};

export default TrendingSection;
