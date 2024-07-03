import React from 'react';
import { Breadcrumbs as MUIBreadcrumbs, Link, Typography, useTheme } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const Breadcrumbs = ({ currentFolder, setCurrentFolder }) => {
  const theme = useTheme();
  const pathParts = currentFolder.split('/').filter(Boolean);

  return (
    <MUIBreadcrumbs
      aria-label="breadcrumb"
      className="breadcrumbs"
      separator={<ChevronRightIcon fontSize="small" />}
    >
      <Link
        color="inherit"
        component="button"
        onClick={() => setCurrentFolder('')}
        className="breadcrumb-link"
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <HomeIcon fontSize="small" style={{ marginRight: '4px' }} />
        Root
      </Link>
      {pathParts.map((part, index) => {
        const path = pathParts.slice(0, index + 1).join('/');
        return index === pathParts.length - 1 ? (
          <Typography key={path} className="breadcrumb-current" style={{ color: theme.palette.text.primary }}>
            {part}
          </Typography>
        ) : (
          <Link
            color="inherit"
            component="button"
            onClick={() => setCurrentFolder(path)}
            key={path}
            className="breadcrumb-link"
          >
            {part}
          </Link>
        );
      })}
    </MUIBreadcrumbs>
  );
};

export default Breadcrumbs;
