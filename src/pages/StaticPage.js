import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import './StaticPage.css';

const pages = {
  terms: {
    eyebrow: 'Terms',
    title: 'Terms & Conditions',
    lead: 'By using Globalसंक्षिप्त, you agree to use the site responsibly and respect the content, services, and source links provided here.',
    sections: [
      {
        title: 'Use of content',
        text: 'Globalसंक्षिप्त is provided for general information and reading. Story ownership remains with the original publishers and sources where applicable.',
      },
      {
        title: 'Service availability',
        text: 'The site may change, pause, or remove features as data sources, APIs, or editorial needs evolve.',
      },
      {
        title: 'User actions',
        text: 'Do not misuse the site, attempt to disrupt the service, or submit harmful, false, or abusive information through forms.',
      },
    ],
  },
  privacy: {
    eyebrow: 'Privacy',
    title: 'Privacy Policy',
    lead: 'Globalसंक्षिप्त keeps data collection limited to what is needed for the reading experience and contact requests.',
    sections: [
      {
        title: 'Contact messages',
        text: 'When you send a contact message, the details you provide are used to respond to your request and route the message to the site owner.',
      },
      {
        title: 'Location and weather',
        text: 'Weather features may use browser location permission or IP-based location lookup to show local conditions. You can deny browser location access.',
      },
      {
        title: 'Saved articles',
        text: 'Saved articles are stored locally in your browser so you can return to them later.',
      },
    ],
  },
};

const StaticPage = ({ type }) => {
  const page = pages[type] || pages.terms;

  return (
    <Box className="static-page-wrapper">
      <Container maxWidth="md">
        <Box className="static-page-shell">
          <Typography className="static-eyebrow">{page.eyebrow}</Typography>
          <Typography component="h1" className="static-title">
            {page.title}
          </Typography>
          <Typography className="static-lead">{page.lead}</Typography>

          {page.sections.map((section) => (
            <Box className="static-section" key={section.title}>
              <Typography component="h2" className="static-section-title">
                {section.title}
              </Typography>
              <Typography className="static-text">{section.text}</Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default StaticPage;
