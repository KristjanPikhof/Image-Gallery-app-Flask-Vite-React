import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Typography, useMediaQuery, useTheme, Grid, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const ImageView = ({ image, onClose, prevImage, nextImage, onPrevImage, onNextImage, isOpen }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft' && prevImage) {
        onPrevImage();
      } else if (event.key === 'ArrowRight' && nextImage) {
        onNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [prevImage, nextImage, onPrevImage, onNextImage]);

  if (!image) {
    return <Typography>No image selected</Typography>;
  }

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
      timeZoneName: 'short',
    }).format(new Date(timestamp * 1000));
  };

  const renderImageInfo = () => (
    <Box sx={{ color: theme.palette.text.primary, backgroundColor: theme.palette.background.paper, padding: '16px', borderRadius: '8px' }}>
      <Typography variant="h6" gutterBottom>
        {image.name}
      </Typography>
      <Typography variant="body2">Size: {(image.size / 1024).toFixed(2)} KB</Typography>
      {image.width && image.height && (
        <Typography variant="body2">
          Dimensions: {image.width}x{image.height} pixels
        </Typography>
      )}
      <Typography variant="body2">Date Added: {formatDate(image.date)}</Typography>
    </Box>
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullScreen}
      className={`image-view-dialog ${!fullScreen ? 'image-view-dialog-desktop' : ''}`}
      TransitionProps={{
        timeout: 300,
      }}
    >
      <DialogContent className="image-view-content" sx={{ bgcolor: theme.palette.background.paper, pb: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
          <IconButton onClick={onClose} color="primary" className="image-view-close-button">
            <CloseIcon />
          </IconButton>
        </Box>
        <Grid container className="image-view-container" sx={{ flexGrow: 1 }}>
          <Grid
            item
            xs={12}
            md={8}
            className="image-view-image-container"
          >
            <TransformWrapper
              initialScale={1}
              initialPositionX={0}
              initialPositionY={0}
            >
              {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                <React.Fragment>
                  <Box className="zoom-controls">
                    <IconButton onClick={() => zoomIn()} className="zoom-button">
                      <ZoomInIcon />
                    </IconButton>
                    <IconButton onClick={() => zoomOut()} className="zoom-button">
                      <ZoomOutIcon />
                    </IconButton>
                  </Box>
                  <TransformComponent>
                    <img
                      src={`${import.meta.env.VITE_FLASK_URL}/images/${image.path}`}
                      alt={image.name}
                      className="image-view-image"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </TransformComponent>
                </React.Fragment>
              )}
            </TransformWrapper>
          </Grid>
          <Grid item xs={12} md={4} className="image-view-info">
            {renderImageInfo()}
          </Grid>
        </Grid>
        <Box sx={{ position: 'absolute', top: '50%', left: 16, transform: 'translateY(-50%)', zIndex: 1 }}>
          <IconButton
            onClick={onPrevImage}
            disabled={!prevImage}
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                color: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            <NavigateBeforeIcon fontSize="large" />
          </IconButton>
        </Box>
        <Box sx={{ position: 'absolute', top: '50%', right: 16, transform: 'translateY(-50%)', zIndex: 1 }}>
          <IconButton
            onClick={onNextImage}
            disabled={!nextImage}
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                color: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            <NavigateNextIcon fontSize="large" />
          </IconButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ImageView;
