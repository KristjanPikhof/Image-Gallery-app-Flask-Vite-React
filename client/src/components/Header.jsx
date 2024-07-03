import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import { AppBar, Toolbar, IconButton, useTheme } from '@mui/material';
import { Brightness4, Brightness7, Menu as MenuIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Header = ({ darkMode, setDarkMode, isMobile, toggleMobileSidebar }) => {
  const theme = useTheme();

  const handleThemeChange = () => {
    const newTheme = darkMode ? 'light' : 'dark';
    Cookies.set('theme', newTheme, { expires: 365 });
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const savedTheme = Cookies.get('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, [setDarkMode]);

  return (
    <AppBar position="static" className="header">
      <Toolbar className="header-toolbar">
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleMobileSidebar}
            className="header-menu-button"
          >
            <MenuIcon />
          </IconButton>
        )}
        <Link to="/" className="header-title">
          Image Gallery
        </Link>
        <nav className="header-nav">
          <Link to="/upload" className="header-nav-item">
            Upload
          </Link>
          <IconButton className="header-icon-button" onClick={handleThemeChange}>
            {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </nav>
      </Toolbar>
    </AppBar>
  );
};

export default Header;