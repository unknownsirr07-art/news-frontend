import React from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import NewsCard from './NewsCard';
import './NewsGrid.css'; // Pure CSS for animations and empty state

const NewsGrid = ({ news, loading = false }) => {
  if (loading) {
    return (
      <Box className="news-grid-container">
        {Array.from({ length: 4 }).map((_, index) => (
          <Box key={index} className="news-grid-item loading">
            <Box className="news-card news-card-standard news-card-skeleton">
              <Skeleton variant="rounded" width={84} height={24} />
              <Skeleton variant="text" height={36} />
              <Skeleton variant="text" height={24} />
              <Skeleton variant="text" height={24} width="72%" />
              <Box className="skeleton-footer">
                <Skeleton variant="text" width={92} />
                <Skeleton variant="text" width={112} />
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (!news?.length) {
    return (
      <Box className="empty-news-state">
        <Typography component="div" variant="h1" className="empty-emoji" aria-hidden="true">
          📰
        </Typography>
        <Typography variant="h5" className="empty-title">
          No News Available
        </Typography>
        <Typography variant="body1" className="empty-subtitle">
          Check back later for the latest updates.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="news-grid-container">
      {news.map((article, index) => (
        <Box
          key={article.article_id}
          className="news-grid-item"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <NewsCard article={article} />
        </Box>
      ))}
    </Box>
  );
};

export default NewsGrid;
