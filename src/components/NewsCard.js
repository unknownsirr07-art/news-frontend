import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Card, CardContent, Typography, Chip, Box, Stack, Link } from '@mui/material';
import './NewsCard.css';

const NewsCard = ({ article, variant = 'standard' }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isFeatured = variant === 'featured';

  return (
    <Card 
      component="article" 
      className={`news-card ${isFeatured ? 'news-card-featured' : 'news-card-standard'}`}
      elevation={0}
    >
      <CardContent className="news-card-content">
        
        {/* Tags */}
        <Stack direction="row" spacing={1} flexWrap="wrap" mb={2} useFlexGap className="news-tag-row">
          {article.tags?.slice(0, 3).map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              size="small"
              className={`news-tag ${isFeatured ? 'tag-featured' : 'tag-standard'}`}
            />
          ))}
        </Stack>
        
        {/* Headline */}
        <Typography 
          variant={isFeatured ? "h4" : "h6"} 
          component="h3" 
          className="news-headline"
        >
          <Link 
            component={RouterLink} 
            to={`/article/${article.slug}`} 
            className={`headline-link ${isFeatured ? 'link-featured' : 'link-standard'}`}
            underline="none"
          >
            {article.headline}
          </Link>
        </Typography>
        
        {/* Deck / Summary */}
        <Typography 
          variant={isFeatured ? "h6" : "body2"} 
          className={`news-deck ${isFeatured ? 'deck-featured' : 'deck-standard'}`}
        >
          {article.deck || article.summary}
        </Typography>
        
        {/* Footer Meta */}
        <Box className={`news-footer ${isFeatured ? 'footer-featured' : 'footer-standard'}`}>
          <Typography variant="caption" className="news-source">
            {article.source_title}
          </Typography>
          <Typography variant="caption" className="news-date">
            {formatDate(article.generated_at)}
          </Typography>
        </Box>

      </CardContent>
    </Card>
  );
};

export default NewsCard;
