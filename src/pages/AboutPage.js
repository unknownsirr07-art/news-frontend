import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import './StaticPage.css';

const AboutPage = () => (
  <Box className="static-page-wrapper">
    <Container maxWidth="md">
      <Box className="static-page-shell">
        <Typography className="static-eyebrow">About NewsHub</Typography>
        <Typography component="h1" className="static-title">
          News that stays clear, quick, and useful.
        </Typography>
        <Typography className="static-lead">
          NewsHub brings together important updates across world news, markets, weather,
          sports, technology, and public interest stories in a clean reading experience.
        </Typography>

        <Box className="static-section">
          <Typography component="h2" className="static-section-title">
            What we publish
          </Typography>
          <Typography className="static-text">
            We focus on timely headlines, concise summaries, and topic-based discovery so
            readers can scan fast and open the stories that matter to them.
          </Typography>
        </Box>

        <Box className="static-section">
          <Typography component="h2" className="static-section-title">
            Our approach
          </Typography>
          <Typography className="static-text">
            The site is designed for everyday reading: readable cards, useful filters,
            saved articles, and article pages with summaries, topics, and source links.
          </Typography>
        </Box>
      </Box>
    </Container>
  </Box>
);

export default AboutPage;
