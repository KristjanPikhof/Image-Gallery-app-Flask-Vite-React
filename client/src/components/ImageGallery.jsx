import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Card, CardMedia, CardContent, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box } from '@mui/material';
import { Info as InfoIcon, Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ImageGallery = ({ images, onImageSelect }) => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [filteredImages, setFilteredImages] = useState(images);
  const [nameFilter, setNameFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filterImages = useCallback(() => {
    let filtered = images;
  
    if (nameFilter) {
      filtered = filtered.filter(image => image.name.toLowerCase().includes(nameFilter.toLowerCase()));
    }
  
    if (sizeFilter) {
      filtered = filtered.filter(image => {
        const sizeKB = image.size / 1024;
        switch (sizeFilter) {
          case 'small': return sizeKB < 100;
          case 'medium': return sizeKB >= 100 && sizeKB < 1000;
          case 'large': return sizeKB >= 1000;
          default: return true;
        }
      });
    }
  
    if (dateFilter) {
      const today = new Date();
      const filterDate = new Date(today.getTime() - (parseInt(dateFilter) * 24 * 60 * 60 * 1000));
      filtered = filtered.filter(image => new Date(image.date * 1000) >= filterDate);
    }
  
    setFilteredImages(filtered);
  }, [images, nameFilter, sizeFilter, dateFilter]);

  useEffect(() => {
    filterImages();
  }, [filterImages]);

  const handleImageClick = (image) => {
    const index = filteredImages.findIndex((img) => img.path === image.path);
    navigate('/view', { 
      state: { 
        image, 
        prevImage: index > 0 ? filteredImages[index - 1] : null, 
        nextImage: index < filteredImages.length - 1 ? filteredImages[index + 1] : null 
      } 
    });
  };

  const handleInfoClick = (e, image) => {
    e.stopPropagation();
    setSelectedImage(image);
    setInfoDialogOpen(true);
  };

  const closeInfoDialog = () => {
    setInfoDialogOpen(false);
    setSelectedImage(null);
  };

  const formatDate = (timestamp) => {
    const userLocale = navigator.language || navigator.userLanguage;
    const use24HourFormat = !['en-US', 'en-GB'].includes(userLocale);
  
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: !use24HourFormat,
      timeZoneName: 'short'
    }).format(new Date(timestamp * 1000));
  };

  const renderImageInfo = useCallback(
    (image) => (
      <>
        <Typography variant="body1">Name: {image.name}</Typography>
        <Typography variant="body2">Size: {(image.size / 1024).toFixed(2)} KB</Typography>
        {image.width && image.height && (
          <Typography variant="body2">Dimensions: {image.width}x{image.height} pixels</Typography>
        )}
        <Typography variant="body2">Date Added: {formatDate(image.date)}</Typography>
      </>
    ),
    []
  );

  return (
    <>
      <Box sx={{ marginBottom: '20px', padding: '10px', backgroundColor: 'background.paper', borderRadius: '8px', boxShadow: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Filter by Name"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Filter by Size"
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
            >
              <MenuItem value="">All Sizes</MenuItem>
              <MenuItem value="small">Small (under 100 KB)</MenuItem>
              <MenuItem value="medium">Medium (100 KB - 1 MB)</MenuItem>
              <MenuItem value="large">Large (over 1 MB)</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Filter by Date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <MenuItem value="">All Time</MenuItem>
              <MenuItem value="1">Last 24 Hours</MenuItem>
              <MenuItem value="7">Last 7 Days</MenuItem>
              <MenuItem value="30">Last 30 Days</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2}>
        {filteredImages.map((image) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={image.path}>
            <Card onClick={() => handleImageClick(image)} sx={{ '&:hover': { transform: 'scale(1.05)', transition: 'transform 0.3s' } }}>
              <div style={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="120"
                  image={`${import.meta.env.VITE_FLASK_URL}/images/${image.path}`}
                  alt={image.name}
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <CardContent style={{ padding: '5px' }}>
                <Typography variant="body2" noWrap>{image.name}</Typography>
              </CardContent>
              <IconButton
                  size="small"
                  className="image-info-button"
                  onClick={(e) => handleInfoClick(e, image)}
                >
                  <InfoIcon />
                </IconButton>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={infoDialogOpen} onClose={closeInfoDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Image Information</DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <CardMedia
                  component="img"
                  image={`${import.meta.env.VITE_FLASK_URL}/images/${selectedImage.path}`}
                  alt={selectedImage.name}
                  style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderImageInfo(selectedImage)}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeInfoDialog} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ImageGallery;
