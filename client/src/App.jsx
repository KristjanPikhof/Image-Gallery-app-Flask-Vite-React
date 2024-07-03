import React, { useState, useEffect, useCallback } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider, createTheme, CssBaseline, useMediaQuery } from '@mui/material';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MobileSidebar from './components/MobileSidebar';
import ImageGallery from './components/ImageGallery';
import ImageUpload from './components/ImageUpload';
import ImageView from './components/ImageView';
import ImageViewWrapper from './components/ImageViewWrapper';
import Breadcrumbs from './components/Breadcrumbs';

const App = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  const [folders, setFolders] = useState([]);
  const [images, setImages] = useState([]);
  const [currentFolder, setCurrentFolder] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 600);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [prevImage, setPrevImage] = useState(null);
  const [nextImage] = useState(null);
  const navigate = useNavigate();

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode],
  );

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 600px)');
    const handleMediaQueryChange = (e) => setIsMobile(e.matches);
  
    mediaQuery.addEventListener('change', handleMediaQueryChange);
    handleMediaQueryChange(mediaQuery); // Set initial value
  
    return () => mediaQuery.removeEventListener('change', handleMediaQueryChange);
  }, []);

  const fetchFolders = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_FLASK_URL}/api/folders`);
      setFolders(response.data);
    } catch (error) {
      console.error('Error fetching folders:', error);
      setFolders([]);
    }
  }, []);

  const fetchImages = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_FLASK_URL}/api/images?folder=${currentFolder}`);
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  }, [currentFolder]);

  useEffect(() => {
    fetchFolders();
    fetchImages();
  }, [currentFolder, fetchFolders, fetchImages]);

  const handleCreateFolder = async (folderName, parentFolder) => {
    console.log('Creating folder:', { folderName, parentFolder });
    try {
      await axios.post(`${import.meta.env.VITE_FLASK_URL}/api/create_folder`, { folderName, parentFolder });
      fetchFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleImageSelect = (image) => {
    const index = images.findIndex((img) => img.path === image.path);
    navigate('/view', { state: { image, prevImage: index > 0 ? images[index - 1] : null, nextImage: index < images.length - 1 ? images[index + 1] : null } });
  };

  const handleImageClose = () => {
    navigate(-1);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          isMobile={isMobile}
          toggleMobileSidebar={toggleMobileSidebar}
        />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {!isMobile ? (
            <Sidebar
              folders={folders}
              setCurrentFolder={setCurrentFolder}
              onCreateFolder={handleCreateFolder}
              currentFolder={currentFolder}
            />
          ) : (
            <MobileSidebar
              folders={folders}
              setCurrentFolder={setCurrentFolder}
              onCreateFolder={handleCreateFolder}
              currentFolder={currentFolder}
              isOpen={isMobileSidebarOpen}
              setIsOpen={setIsMobileSidebarOpen}
            />
          )}
          <main style={{ flex: 1, overflow: 'auto', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <Breadcrumbs currentFolder={currentFolder} setCurrentFolder={setCurrentFolder} />
            <Routes>
              <Route
                path="/"
                element={<ImageGallery images={images} onImageSelect={handleImageSelect} />}
              />
              <Route
                path="/upload"
                element={
                  <ImageUpload
                    currentFolder={currentFolder}
                    fetchImages={fetchImages}
                    onCreateFolder={handleCreateFolder}
                    folders={folders}
                  />
                }
              />
              <Route
                path="/view"
                element={<ImageViewWrapper />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;
