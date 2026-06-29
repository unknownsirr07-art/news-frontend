import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Button,
  IconButton,
  Typography,
  Collapse,
  Stack,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Bookmark as BookmarkIcon
} from '@mui/icons-material';
import { getSavedArticles } from '../utils/savedArticles';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const syncSavedCount = () => setSavedCount(getSavedArticles().length);
    syncSavedCount();
    window.addEventListener('savedArticlesChanged', syncSavedCount);
    window.addEventListener('storage', syncSavedCount);
    return () => {
      window.removeEventListener('savedArticlesChanged', syncSavedCount);
      window.removeEventListener('storage', syncSavedCount);
    };
  }, []);

  const navItems = [
    { label: 'All', path: '/' },
    { label: 'India', path: '/category/india' },
    { label: 'World', path: '/category/world' },
    { label: 'Politics', path: '/category/politics' },
    { label: 'Sports', path: '/category/sports' },
    { label: 'Science', path: '/category/science' },
    { label: 'Tech', path: '/category/technology' },
  ];

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      className={`navbar-root ${isScrolled ? 'scrolled' : 'transparent'}`}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters className="navbar-toolbar">
          
          {/* Logo */}
          <Box component={RouterLink} to="/" className="navbar-brand">
            <Box className="logo-box">
              <Typography variant="h6" fontWeight="bold">N</Typography>
            </Box>
            <Typography variant="h5" className="brand-text">
              Globalसंक्षिप्त
            </Typography>
          </Box>

          {/* Desktop Menu */}
          <Box className="desktop-menu">
            {navItems.map((item) => (
              <Button
                key={item.label}
                component={RouterLink}
                to={item.path}
                className="nav-link"
                disableRipple
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Right Actions */}
          <Box className="navbar-actions">
            <Button
              component={RouterLink}
              to="/saved"
              startIcon={
                <Badge badgeContent={savedCount} color="primary" max={99}>
                  <BookmarkIcon fontSize="small" />
                </Badge>
              }
              className="saved-nav-button desktop-only"
              disableRipple
            >
              Saved
            </Button>
            <IconButton 
              className="mobile-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="toggle menu"
            >
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Box>
          
        </Toolbar>
      </Container>

      {/* Mobile Menu (Collapsible) */}
      <Collapse in={isMenuOpen} timeout="auto" unmountOnExit>
        <Box className="mobile-menu">
          <Stack spacing={1}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                component={RouterLink}
                to={item.path}
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
                fullWidth
              >
                {item.label}
              </Button>
            ))}
            <Button
              component={RouterLink}
              to="/saved"
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
              fullWidth
            >
              Saved Articles {savedCount > 0 ? `(${savedCount})` : ''}
            </Button>
          </Stack>
        </Box>
      </Collapse>
    </AppBar>
  );
};

export default Navbar;
