import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import SEO from '../components/SEO';

const NotFoundPage = () => (
  <Box className="center-screen flex-column">
    <SEO
      title="Page Not Found | Global Sankshipt"
      description="The requested page could not be found."
      canonicalPath="/404"
      robots="noindex, nofollow"
    />
    <Container maxWidth="sm">
      <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
        Page not found
      </Typography>
      <Typography variant="body1" mb={3}>
        The page you are looking for may have moved or no longer exists.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Return Home
      </Button>
    </Container>
  </Box>
);

export default NotFoundPage;
