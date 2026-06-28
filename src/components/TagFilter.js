import React from 'react';
import { Stack, Chip, Box } from '@mui/material';
import './TagFilter.css';

const TagFilter = ({ tags, selectedTags, onTagSelect }) => {
  return (
    <Box className="tag-filter-wrapper">
      <Stack 
        direction="row" 
        spacing={1.5} 
        className="tag-filter-container"
        useFlexGap
      >
        {tags.slice(0, 20).map((tag, index) => {
          const isSelected = selectedTags.includes(tag);
          
          return (
            <Chip
              key={index}
              label={tag}
              onClick={() => onTagSelect(tag)}
              clickable
              className={`filter-chip ${isSelected ? 'chip-selected' : 'chip-default'}`}
            />
          );
        })}
      </Stack>
    </Box>
  );
};

export default TagFilter;
