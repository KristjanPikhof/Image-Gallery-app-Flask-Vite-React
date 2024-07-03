import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ImageView from './ImageView';
import axios from 'axios';

const ImageViewWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentImage, setCurrentImage] = useState(null);
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (location.state && location.state.image) {
      setCurrentImage(location.state.image);
      setIsOpen(true);
      fetchImages(location.state.image.path);
    }
  }, [location.state]);

  const fetchImages = async (imagePath) => {
    try {
      const folder = imagePath.split('/').slice(0, -1).join('/');
      const response = await axios.get(`${import.meta.env.VITE_FLASK_URL}/api/images?folder=${folder}`);
      setImages(response.data);
      const index = response.data.findIndex(img => img.path === imagePath);
      setCurrentIndex(index);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleImageClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };

  const handlePrevImage = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentImage(images[prevIndex]);
    }
  };

  const handleNextImage = () => {
    if (currentIndex < images.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentImage(images[nextIndex]);
    }
  };

  if (!currentImage) {
    return null;
  }

  return (
    <ImageView
      image={currentImage}
      onClose={handleImageClose}
      prevImage={currentIndex > 0 ? images[currentIndex - 1] : null}
      nextImage={currentIndex < images.length - 1 ? images[currentIndex + 1] : null}
      onPrevImage={handlePrevImage}
      onNextImage={handleNextImage}
      isOpen={isOpen}
    />
  );
};

export default ImageViewWrapper;
