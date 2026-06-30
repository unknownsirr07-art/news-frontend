import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import SEO from './SEO';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Application error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box className="center-screen flex-column">
        <SEO
          title="Something Went Wrong | Global Sankshipt"
          description="The page could not be loaded right now."
          canonicalPath="/500"
          robots="noindex, nofollow"
        />
        <Container maxWidth="sm">
          <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" mb={3}>
            Please refresh the page or return to the front page.
          </Typography>
          <Button href="/" variant="contained">
            Return Home
          </Button>
        </Container>
      </Box>
    );
  }
}

export default ErrorBoundary;
