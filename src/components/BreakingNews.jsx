import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import './BreakingNews.css';

const BreakingNews = ({ news }) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const datePart = date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
    const timePart = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${datePart}, ${timePart}`;
  };

  const breakingItems = news?.length ? news : [];

  return (
    <Box className="breaking-news-container">
      <Box className="breaking-news-content">
        
        {/* Pulsing Badge */}
        <Box className="breaking-badge">
          <Typography variant="button" fontWeight="bold">
            BREAKING
          </Typography>
        </Box>
        
        {/* Scrolling Text */}
        <Box className="marquee-wrapper">
          <Box className="marquee-text">
            {breakingItems.length > 0 ? (
              breakingItems.map((article, index) => (
                <React.Fragment key={article.article_id || article.slug || index}>
                  <Typography
                    component={RouterLink}
                    to={`/article/${article.slug}`}
                    className="breaking-item"
                  >
                    [{formatDateTime(article.generated_at)}] {article.headline}
                  </Typography>
                  {index < breakingItems.length - 1 && (
                    <span className="breaking-separator" aria-hidden="true" />
                  )}
                </React.Fragment>
              ))
            ) : (
              <Typography component="span" className="breaking-item">
                Latest breaking news updates...
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BreakingNews;
