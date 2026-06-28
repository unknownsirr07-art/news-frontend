import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Divider,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import './Footer.css';

const footerLinks = [
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box component="footer" className="footer-wrapper">
      <Container maxWidth="xl" className="footer-container">
        <Box className="footer-top">
          <Box className="footer-brand">
            <Box className="logo-box">
              <Typography variant="h6" fontWeight="bold">N</Typography>
            </Box>
            <Typography variant="h6" component="span" fontWeight="bold" className="brand-name">
              NewsHub
            </Typography>
          </Box>

          <Stack component="ul" className="footer-list">
            {footerLinks.map((link) => (
              <li key={link.to}>
                <Link component={RouterLink} to={link.to} className="footer-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </Stack>
        </Box>

        <Box className="footer-bottom">
          <Divider className="footer-divider" />
          <Typography variant="body2" className="copyright-text">
            &copy; {currentYear} NewsHub. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
