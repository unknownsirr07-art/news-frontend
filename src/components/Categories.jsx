import React from 'react';
import { Box, Typography, ButtonBase } from '@mui/material';
import {
  Home as HomeIcon,
  Public as PublicIcon,
  Memory as MemoryIcon,
  BusinessCenter as BusinessCenterIcon,
  Movie as MovieIcon,
  EmojiEvents as TrophyIcon,
  Favorite as HeartIcon,
  Science as ScienceIcon,
  Flag as FlagIcon,
  AccountBalance as PoliticsIcon,
  MoreHoriz as MoreIcon
} from '@mui/icons-material';
import './Categories.css';

const categories = [
  { id: 'home', name: 'Home', icon: HomeIcon },
  { id: 'world', name: 'World', icon: PublicIcon },
  { id: 'india', name: 'India', icon: FlagIcon },
  { id: 'politics', name: 'Politics', icon: PoliticsIcon },
  { id: 'business', name: 'Business', icon: BusinessCenterIcon },
  { id: 'technology', name: 'Technology', icon: MemoryIcon },
  { id: 'health', name: 'Health', icon: HeartIcon },
  { id: 'sports', name: 'Sports', icon: TrophyIcon },
  { id: 'entertainment', name: 'Entertainment', icon: MovieIcon },
  { id: 'science', name: 'Science', icon: ScienceIcon },
  { id: 'others', name: 'Others', icon: MoreIcon },
];

const Categories = ({ activeCategory, onCategoryChange }) => {
  return (
    <Box className="categories-section">
      <Typography variant="h4" component="h2" className="categories-title">
        Browse by <span className="gradient-text">Category</span>
      </Typography>
      
      <Box className="categories-grid">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          
          return (
            <ButtonBase
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`category-button ${isActive ? 'active' : ''}`}
              disableRipple={false}
            >
              <Icon className="category-icon" />
              <Typography variant="body2" className="category-name">
                {category.name}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
};

export default Categories;
