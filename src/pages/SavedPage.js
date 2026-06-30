import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { Bookmark, Close } from '@mui/icons-material';
import { format } from 'date-fns';
import { getSavedArticles, removeSavedArticle } from '../utils/savedArticles';
import SEO from '../components/SEO';
import { SITE_NAME } from '../utils/seo';
import './SavedPage.css';


const SavedPage = () => {
  const [savedArticles, setSavedArticles] = useState([]);

  useEffect(() => {
    setSavedArticles(getSavedArticles());
  }, []);

  const handleRemove = (slug) => {
    setSavedArticles(removeSavedArticle(slug));
  };

  return (
    <Box className="saved-page-wrapper">
      <SEO
        title={`Saved Articles | ${SITE_NAME}`}
        description="Articles saved locally on this device."
        canonicalPath="/saved"
        robots="noindex, follow"
      />
      <Container maxWidth="lg" className="saved-page-container">
        <Box className="saved-page-header">
          <Box className="saved-title-wrap">
            <Bookmark />
            <Typography component="h1" variant="h3" className="saved-page-title">
              Saved Articles
            </Typography>
          </Box>
          <Typography variant="body1" className="saved-page-subtitle">
            Articles saved on this device.
          </Typography>
        </Box>

        {savedArticles.length === 0 ? (
          <Box className="saved-empty">
            <Typography variant="h5" fontWeight="800">
              No saved articles yet
            </Typography>
            <Typography variant="body1">
              Save stories from any article page and they will appear here locally.
            </Typography>
            <Button component={RouterLink} to="/" variant="contained" className="saved-home-button">
              Browse News
            </Button>
          </Box>
        ) : (
          <Box className="saved-grid">
            {savedArticles.map((article) => (
              <Card className="saved-card" elevation={0} key={article.slug}>
                <CardActionArea component={RouterLink} to={`/article/${article.slug}`} className="saved-card-action">
                  <CardContent>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={2}>
                      {article.tags?.slice(0, 3).map((tag) => (
                        <Chip key={tag} label={tag} size="small" className="saved-tag" />
                      ))}
                    </Stack>
                    <Typography variant="h5" className="saved-card-title">
                      {article.headline}
                    </Typography>
                    <Typography variant="body2" className="saved-card-deck">
                      {article.deck || article.summary}
                    </Typography>
                    <Typography variant="caption" className="saved-card-meta">
                      {article.source_title}
                      {article.generated_at ? ` - ${format(new Date(article.generated_at), 'MMM d, yyyy')}` : ''}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <Button
                  startIcon={<Close />}
                  className="saved-remove-button"
                  onClick={() => handleRemove(article.slug)}
                >
                  Remove
                </Button>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default SavedPage;
