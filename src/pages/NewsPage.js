import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Chip, 
  CircularProgress, 
  Button, 
  Grid,
  Link,
  Card,
  CardContent,
  CardActionArea,
  Stack,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from '@mui/material';
import {
  CalendarToday,
  Link as LinkIcon,
  Share,
  BookmarkBorder,
  Bookmark,
  ArrowBack,
  AccessTime,
  AutoAwesome,
  ContentCopy,
  WhatsApp,
  Email
} from '@mui/icons-material';
import Facebook from '@mui/icons-material/Facebook';
import LinkedIn from '@mui/icons-material/LinkedIn';
import Telegram from '@mui/icons-material/Telegram';
import { format } from 'date-fns';
import { newsService } from '../services/api';
import { isArticleSaved, removeSavedArticle, saveArticle } from '../utils/savedArticles';
import SEO from '../components/SEO';
import {
  SITE_NAME,
  SITE_URL,
  getArticleDescription,
  getArticleImage,
  getArticleKeywords,
  getCanonicalUrl,
  getReadingTime,
} from '../utils/seo';
import './NewsPage.css'; 

const AI_SUMMARY_MESSAGE = 'Reading the story, finding the key points, and preparing a clear summary.';

const NewsPage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [articleLoadError, setArticleLoadError] = useState(false);
  const [articleNotFound, setArticleNotFound] = useState(false);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [notice, setNotice] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [contentReady, setContentReady] = useState(false);
  const [typedSummaryText, setTypedSummaryText] = useState('');

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(scroll * 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await newsService.getArticleBySlug(slug);
        setArticle(response.data);
        setArticleNotFound(false);
        setArticleLoadError(false);
        setSaved(isArticleSaved(response.data.slug));
        
        if (response.data.tags?.length) {
          const related = await newsService.getTrendingNews(
            response.data.tags.slice(0, 3).join(',')
          );
          setRelatedNews(
            related.data.items.filter(item => item.slug !== slug).slice(0, 3)
          );
        }
      } catch (error) {
        console.error('Error:', error);
        setArticle(null);
        setRelatedNews([]);
        setSaved(false);
        if (error?.response?.status === 404) {
          setArticleNotFound(true);
          setArticleLoadError(false);
        } else {
          setArticleNotFound(false);
          setArticleLoadError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    window.scrollTo(0, 0);
    setLoading(true);
    setContentReady(false);
    setTypedSummaryText('');
    setArticle(null);
    setArticleLoadError(false);
    setArticleNotFound(false);
    fetchArticle();
  }, [slug]);

  useEffect(() => {
    if (loading || !article) return undefined;

    const revealTimer = window.setTimeout(() => {
      setContentReady(true);
    }, 6000);

    return () => window.clearTimeout(revealTimer);
  }, [article, loading]);

  useEffect(() => {
    if (loading || !article || contentReady) return undefined;

    setTypedSummaryText('');
    let nextIndex = 0;
    const typingTimer = window.setInterval(() => {
      nextIndex += 1;
      setTypedSummaryText(AI_SUMMARY_MESSAGE.slice(0, nextIndex));

      if (nextIndex >= AI_SUMMARY_MESSAGE.length) {
        window.clearInterval(typingTimer);
      }
    }, 45);

    return () => window.clearInterval(typingTimer);
  }, [article, contentReady, loading]);

  const getArticleUrl = () => article ? getCanonicalUrl(`/article/${article.slug}`) : window.location.href;
  const getShareText = () => `${article?.headline} - ${getArticleUrl()}`;

  const copyArticleLink = async () => {
    const url = getArticleUrl();
    try {
      await navigator.clipboard.writeText(url);
      setNotice('Article link copied!');
    } catch (error) {
      setNotice('Failed to copy link');
    }
    setShareAnchorEl(null);
  };

  const handleSaveArticle = () => {
    if (saved) {
      removeSavedArticle(article.slug);
      setSaved(false);
      setNotice('Removed from saved articles');
      return;
    }
    saveArticle(article);
    setSaved(true);
    setNotice('Article saved for later');
  };

  const handleShareClick = async (event) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.headline,
          text: article.deck || article.summary || article.headline,
          url: getArticleUrl(),
        });
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    setShareAnchorEl(event.currentTarget);
  };

  const openShareTarget = (target) => {
    const url = encodeURIComponent(getArticleUrl());
    const text = encodeURIComponent(article.headline);
    const body = encodeURIComponent(getShareText());
    const targets = {
      whatsapp: `https://wa.me/?text=${body}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      x: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      email: `mailto:?subject=${text}&body=${body}`,
    };
    window.open(targets[target], '_blank', 'noopener,noreferrer');
    setShareAnchorEl(null);
  };

  if (loading) {
    return (
      <Box className="center-screen">
        <CircularProgress size={48} className="loading-spinner" />
      </Box>
    );
  }

  if (articleLoadError) {
    return (
      <Box className="center-screen flex-column">
        <SEO
          title={`Article Temporarily Unavailable | ${SITE_NAME}`}
          description="This article is temporarily unavailable. Please try again shortly."
          canonicalPath={`/article/${slug}`}
        />
        <Typography component="h1" variant="h5" fontWeight="bold" gutterBottom>
          Article temporarily unavailable
        </Typography>
        <Typography variant="body1" mb={2}>
          We could not load this story right now. Please refresh and try again.
        </Typography>
        <Link component={RouterLink} to="/" className="back-link">
          ← Return to Front Page
        </Link>
      </Box>
    );
  }

  if (articleNotFound || !article) {
    return (
      <Box className="center-screen flex-column">
        <SEO
          title={`Story Not Found | ${SITE_NAME}`}
          description="The requested story could not be found."
          canonicalPath="/404"
          robots="noindex, nofollow"
        />
        <Typography component="div" variant="h1" className="not-found-emoji" aria-hidden="true">📰</Typography>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Story Not Found
        </Typography>
        <Link component={RouterLink} to="/" className="back-link">
          ← Return to Front Page
        </Link>
      </Box>
    );
  }

  const description = getArticleDescription(article);
  const image = getArticleImage(article);
  const keywords = getArticleKeywords(article);
  const canonicalPath = `/article/${article.slug}`;
  const readingTime = getReadingTime(article);
  const articleAuthor = article.author || article.source_title || `${SITE_NAME} Staff`;
  const publishedDate = article.generated_at || article.updated_at;
  const updatedDate = article.updated_at || article.generated_at;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.headline,
    description,
    image: [image],
    author: {
      '@type': 'Person',
      name: articleAuthor,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/GS.png`,
      },
    },
    datePublished: publishedDate,
    dateModified: updatedDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': getCanonicalUrl(canonicalPath),
    },
    articleSection: article.category || article.tags?.[0],
    keywords: keywords.join(', '),
  };

  return (
    <Box className="article-page-wrapper">
      <SEO
        title={`${article.headline} | ${SITE_NAME}`}
        description={description}
        canonicalPath={canonicalPath}
        image={image}
        type="article"
        keywords={keywords}
        author={articleAuthor}
        jsonLd={articleSchema}
      />
      
      {/* Reading Progress Bar */}
      <Box className="progress-bar-container">
        <Box className="progress-bar" style={{ width: `${scrollProgress}%` }} />
      </Box>

      {/* Sticky Navigation */}
      <Box className="sticky-nav">
        <Container maxWidth="lg" className="nav-container">
          <Button 
            component={RouterLink} 
            to="/" 
            startIcon={<ArrowBack />}
            className="nav-back-button"
            disableRipple
          >
            Globalसंक्षिप्त
          </Button>
          
          {/* Condensed actions for sticky header */}
          <Box className="nav-actions-desktop">
             <Button onClick={handleShareClick} startIcon={<Share />} size="small" className="btn-icon-only">Share</Button>
             <Button onClick={handleSaveArticle} startIcon={saved ? <Bookmark /> : <BookmarkBorder />} size="small" className="btn-icon-only">Save</Button>
          </Box>
        </Container>
      </Box>

      {/* Article Header */}
      <Box className="article-header-section">
        <Container maxWidth="md">
          <Stack direction="row" spacing={1} flexWrap="wrap" mb={4} useFlexGap className="article-tag-row">
            {article.tags?.map((tag, i) => (
              <Chip key={i} label={tag} className="gradient-chip" size="medium"/>
            ))}
          </Stack>

          <Typography variant="h1" className="article-headline">
            {article.headline}
          </Typography>
          
          {article.deck && (
            <Typography variant="h2" className="article-deck">
              {article.deck}
            </Typography>
          )}

          {/* Premium Meta Info Layout */}
          <Box className="article-meta">
            <Box className="meta-author-group">
              <Avatar sx={{ width: 40, height: 40, bgcolor: '#2563eb' }} aria-label={article.source_title || articleAuthor}>
                {article.source_title?.charAt(0) || 'N'}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight="700" color="#0f172a">
                  {articleAuthor}
                </Typography>
                <Box className="meta-details">
                  <span className="meta-item"><CalendarToday fontSize="inherit" /> {publishedDate && format(new Date(publishedDate), 'MMM d, yyyy')}</span>
                  <span className="meta-dot">•</span>
                  <span className="meta-item"><AccessTime fontSize="inherit" /> {readingTime} min read</span>
                  {updatedDate && updatedDate !== publishedDate && (
                    <>
                      <span className="meta-dot">•</span>
                      <span className="meta-item">Updated {format(new Date(updatedDate), 'MMM d, yyyy')}</span>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
            
            {article.source_link && (
              <a href={article.source_link} target="_blank" rel="noopener noreferrer" className="meta-link-btn">
                <LinkIcon fontSize="small" /> Source
              </a>
            )}
          </Box>
        </Container>
      </Box>

      {/* Article Content */}
      <Container maxWidth="md" className="article-content-section">
        {article.image && (
          <Box className="article-featured-image-wrap">
            <img
              src={image}
              alt={article.headline}
              className="article-featured-image"
              loading="eager"
              width="960"
              height="540"
              decoding="async"
            />
          </Box>
        )}

        {article.summary && (
          !contentReady ? (
            <Box className="ai-summary-loading" role="status" aria-live="polite">
              <Box className="summary-heading">
                <Box className="icon-glow-wrap ai-thinking-icon">
                  <AutoAwesome fontSize="small" className="glow-icon" />
                </Box>
                <Typography variant="subtitle1" className="summary-title">
                  AI is summarising
                </Typography>
              </Box>
              <Box className="ai-thinking-lines">
                <span />
                <span />
                <span />
              </Box>
              <Typography variant="body2" className="ai-thinking-copy">
                {typedSummaryText}
                <span className="typing-cursor" aria-hidden="true" />
              </Typography>
            </Box>
          ) : (
            <Box className="article-content-reveal">
              <Box className="summary-block">
                <Box className="summary-heading">
                  <Box className="icon-glow-wrap">
                    <AutoAwesome fontSize="small" className="glow-icon" />
                  </Box>
                  <Typography variant="subtitle1" className="summary-title">
                    AI Summary
                  </Typography>
                </Box>
                <Typography variant="body1" className="summary-text">
                  {article.summary}
                </Typography>
              </Box>
            </Box>
          )
        )}

        {/* Article Body */}
        <Box className="article-body">
          {article.sections?.map((section, index) => (
            <Box key={index} className="article-section">
              {section.subheading && (
                <Typography variant="h3" className="section-subheading">
                  {section.subheading}
                </Typography>
              )}
              <Typography variant="body1" className="section-content">
                {section.content}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Modern Action Toolbar */}
        <Box className="action-toolbar">
          <Button 
            variant="contained" 
            startIcon={saved ? <Bookmark /> : <BookmarkBorder />} 
            className={`toolbar-btn ${saved ? 'btn-saved' : 'btn-primary'}`}
            disableElevation
            onClick={handleSaveArticle}
            fullWidth
          >
            {saved ? 'Saved to Library' : 'Save Article'}
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Share />} 
            className="toolbar-btn btn-secondary"
            onClick={handleShareClick}
            fullWidth
          >
            Share Story
          </Button>
        </Box>
        
        <Menu anchorEl={shareAnchorEl} open={Boolean(shareAnchorEl)} onClose={() => setShareAnchorEl(null)} PaperProps={{ elevation: 3, sx: { mt: 1, borderRadius: 2, minWidth: 180 } }}>
          <MenuItem onClick={copyArticleLink}><ContentCopy fontSize="small" className="share-menu-icon" /> Copy Link</MenuItem>
          <MenuItem onClick={() => openShareTarget('whatsapp')}><WhatsApp fontSize="small" className="share-menu-icon" /> WhatsApp</MenuItem>
          <MenuItem onClick={() => openShareTarget('telegram')}><Telegram fontSize="small" className="share-menu-icon" /> Telegram</MenuItem>
          <MenuItem onClick={() => openShareTarget('facebook')}><Facebook fontSize="small" className="share-menu-icon" /> Facebook</MenuItem>
          <MenuItem onClick={() => openShareTarget('linkedin')}><LinkedIn fontSize="small" className="share-menu-icon" /> LinkedIn</MenuItem>
          <MenuItem onClick={() => openShareTarget('x')}><Share fontSize="small" className="share-menu-icon" /> X (Twitter)</MenuItem>
          <MenuItem onClick={() => openShareTarget('email')}><Email fontSize="small" className="share-menu-icon" /> Email</MenuItem>
        </Menu>

        <Divider sx={{ my: 5, borderColor: '#e2e8f0' }} />

        {/* Tags */}
        <Box className="tags-cloud">
          <Typography variant="subtitle1" fontWeight="700" color="#64748b" mb={2} textTransform="uppercase" letterSpacing={1}>
            Topics in this story
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap className="story-tag-row">
            {article.tags?.map((tag, i) => (
              <Chip key={i} label={`#${tag}`} component={RouterLink} to={`/?tag=${tag}`} clickable className="cloud-chip" />
            ))}
          </Stack>
        </Box>
      </Container>

      {/* Related News - Refined Cards */}
      {relatedNews.length > 0 && (
        <Box className="related-news-section">
          <Container maxWidth="lg">
            <Typography variant="h3" className="related-news-title">
              Continue <span className="gradient-text">Reading</span>
            </Typography>
            
            <Grid container spacing={4}>
              {relatedNews.map((item) => (
                <Grid item xs={12} md={4} key={item.article_id}>
                  <Card className="related-card" elevation={0}>
                    <CardActionArea component={RouterLink} to={`/article/${item.slug}`} className="related-card-action">
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap className="related-tag-row">
                          {item.tags?.slice(0, 2).map((tag, i) => (
                            <Chip key={i} label={tag} size="small" className="related-tag" />
                          ))}
                        </Stack>
                        <Typography variant="h6" className="related-headline">
                          {item.headline}
                        </Typography>
                        <Typography variant="body2" className="related-deck">
                          {item.deck}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      <Snackbar open={Boolean(notice)} autoHideDuration={3000} onClose={() => setNotice('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setNotice('')} sx={{ borderRadius: 2, fontWeight: 600 }}>
          {notice}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewsPage;
