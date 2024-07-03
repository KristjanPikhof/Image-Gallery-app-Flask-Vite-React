import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Typography, 
  Paper, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  LinearProgress, 
  Snackbar, 
  List, 
  ListItem, 
  ListItemText,
  Collapse,
  IconButton,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import { ExpandLess, ExpandMore, CreateNewFolder, Folder, CheckCircleOutline, ErrorOutline, Lock, Cancel, Check } from '@mui/icons-material';
import InputAdornment from '@mui/material/InputAdornment';

const ImageUpload = ({ currentFolder, fetchImages, onCreateFolder, folders = [] }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [isPasswordProtected, setIsPasswordProtected] = useState(true);
  const [isSelectFolderDialogOpen, setIsSelectFolderDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [openFolders, setOpenFolders] = useState({});

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_FLASK_URL}/api/is-password-protected`)
      .then(response => {
        setIsPasswordProtected(response.data.isPasswordProtected);
      })
      .catch(error => {
        console.error('Error checking password protection:', error);
      });
  }, []);

  const uploadFiles = useCallback((files, inputPassword = '', folderToUse = '') => {
    const targetFolder = folderToUse || selectedFolder || currentFolder;
    console.log('Uploading files to folder:', targetFolder);
    
    if (!targetFolder || targetFolder === 'root') {
      setIsSelectFolderDialogOpen(true);
      setFilesToUpload(files);
      return;
    }
  
    files.forEach((file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', targetFolder);
      formData.append('password', inputPassword);
  
      setUploadProgress(0);
      setUploadStatus('uploading');
      setSnackbarOpen(true);
      setSnackbarMessage('Uploading file...');
  
      axios.post(`${import.meta.env.VITE_FLASK_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      })
      .then((response) => {
        console.log('File uploaded successfully', response);
        setUploadStatus('success');
        setSnackbarMessage('File uploaded successfully!');
        setSnackbarOpen(true);
        fetchImages(targetFolder);
      })
      .catch((error) => {
        console.error('Error uploading file:', error.response ? error.response.data : error);
        setUploadStatus('error');
        setSnackbarMessage(error.response?.data?.error || 'Error uploading file. Please try again.');
        setSnackbarOpen(true);
      });
    });
  }, [
    selectedFolder,
    currentFolder,
    setIsSelectFolderDialogOpen,
    setFilesToUpload,
    setUploadProgress,
    setUploadStatus,
    setSnackbarOpen,
    setSnackbarMessage,
    fetchImages
  ]);

  const handleUpload = useCallback((files) => {
    if (!currentFolder || currentFolder === 'root') {
      setIsSelectFolderDialogOpen(true);
      setFilesToUpload(files);
    } else if (isPasswordProtected) {
      setFilesToUpload(files);
      setIsPasswordDialogOpen(true);
    } else {
      uploadFiles(files, '', currentFolder);
    }
  }, [currentFolder, isPasswordProtected, uploadFiles]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setSnackbarOpen(true);
      setSnackbarMessage('Some files are not supported and were rejected.');
      console.log('Rejected files:', rejectedFiles);
    }
  
    if (acceptedFiles.length > 0) {
      handleUpload(acceptedFiles);
    }
  }, [handleUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg', '.tiff'],
      'video/*': ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.mkv', '.webm'],
      'application/octet-stream': ['.raw', '.cr2', '.nef', '.arw']
    }
  });

  const handleSelectFolder = useCallback((folderPath) => {
    console.log('handleSelectFolder called with:', folderPath);
    setSelectedFolder(folderPath);
    setIsSelectFolderDialogOpen(false);
  
    if (filesToUpload.length > 0) {
      if (isPasswordProtected) {
        setIsPasswordDialogOpen(true);
      } else {
        uploadFiles(filesToUpload, '', folderPath);
      }
    }
  }, [filesToUpload, isPasswordProtected, uploadFiles]);

  const handleCreateFolderAndSelect = useCallback(() => {
    if (newFolderName) {
      console.log('Creating and selecting new folder:', newFolderName);
      onCreateFolder(newFolderName);
      handleSelectFolder(newFolderName);
      setNewFolderName('');
      setIsCreateFolderDialogOpen(false);
      // Update the current folder state instead of navigating
      fetchImages(newFolderName);
    }
  }, [newFolderName, onCreateFolder, handleSelectFolder, fetchImages]);

  const handleCreateFolderSubmit = async () => {
    if (newFolderName) {
      try {
        await onCreateFolder(newFolderName, currentFolder);
        setNewFolderName('');
        setIsCreateFolderDialogOpen(false);
  
        if (filesToUpload.length > 0) {
          if (isPasswordProtected) {
            setIsPasswordDialogOpen(true);
          } else {
            uploadFiles(filesToUpload);
          }
        }
      } catch (error) {
        console.error('Error creating folder:', error);
        setSnackbarOpen(true);
        setSnackbarMessage('Error creating folder. Please try again.');
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleCreateFolderSubmit();
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handlePasswordSubmit = () => {
    setIsPasswordDialogOpen(false);
    uploadFiles(filesToUpload, password, currentFolder);
    setPassword('');
  };

  const toggleFolder = (folderPath) => {
    setOpenFolders(prev => ({ ...prev, [folderPath]: !prev[folderPath] }));
  };

  const renderFolders = (folderList, depth = 0, parentPath = '') => {
    return folderList.map((folder) => {
      const fullPath = parentPath ? `${parentPath}/${folder.name}` : folder.name;
      const hasChildren = folder.children && folder.children.length > 0;
      const isOpen = openFolders[fullPath];
  
      return (
        <React.Fragment key={fullPath}>
          <ListItem 
            button 
            onClick={() => {
              if (hasChildren) {
                toggleFolder(fullPath);
              } else {
                handleSelectFolder(fullPath);
              }
            }}
            className={`folder-item ${selectedFolder === fullPath ? 'selected' : ''}`}
            style={{ paddingLeft: `${depth * 16}px` }}
          >
            {hasChildren && (
              <div className="folder-icon">
                {isOpen ? <ExpandLess /> : <ExpandMore />}
              </div>
            )}
            <ListItemText primary={folder.name} />
          </ListItem>
          {hasChildren && (
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderFolders(folder.children, depth + 1, fullPath)}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        📂 Upload Your Files
      </Typography>
      <div {...getRootProps()} style={{ border: '2px dashed gray', padding: '20px', marginBottom: '20px', cursor: 'pointer' }}>
        <input {...getInputProps()} ref={fileInputRef} />
        {isDragActive ? (
          <Typography>📎 Drop your files here...</Typography>
        ) : (
          <>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current.click();
              }}
            >
              📁 Choose Files
            </Button>
            <Typography style={{ marginTop: '10px' }}>or 📎 Drag and Drop Here</Typography>
            <Typography variant="caption">✨ Tip: You can select multiple files at once!</Typography>
          </>
        )}
      </div>
      {uploadStatus === 'uploading' && (
        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', mt: 2 }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate" value={uploadProgress} size={68} />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" component="div" color="text.secondary">
                {`${Math.round(uploadProgress)}%`}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ mt: 1 }}>Uploading...</Typography>
        </Box>
      )}
      {uploadStatus === 'success' && (
        <Alert icon={<CheckCircleOutline fontSize="inherit" />} severity="success" sx={{ mt: 2 }}>
          File uploaded successfully!
        </Alert>
      )}
      {uploadStatus === 'error' && (
        <Alert icon={<ErrorOutline fontSize="inherit" />} severity="error" sx={{ mt: 2 }}>
          Error uploading file. Please try again.
        </Alert>
      )}
      <Typography variant="body2" gutterBottom>
        Supported formats: 
        📷 Common image formats (JPG, PNG, GIF, etc.) |
        📸 RAW images |
        📹 Common video formats (MP4, MOV, etc.)
      </Typography>
      <Dialog open={isSelectFolderDialogOpen} onClose={() => setIsSelectFolderDialogOpen(false)}>
        <DialogTitle>Select or Create a Folder</DialogTitle>
        <DialogContent>
          {folders && folders.length > 0 ? (
            <List>
              {renderFolders(folders)}
            </List>
          ) : (
            <Typography>No folders available. Create a new one!</Typography>
          )}
          <Button 
            onClick={() => setIsCreateFolderDialogOpen(true)} 
            color="primary" 
            variant="contained" 
            startIcon={<CreateNewFolder />}
            style={{ marginTop: '16px' }}
          >
            Create New Folder
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={isCreateFolderDialogOpen} onClose={() => setIsCreateFolderDialogOpen(false)}>
        <DialogTitle>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CreateNewFolder style={{ marginRight: '10px' }} />
            Create New Folder
          </div>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Folder Name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyPress={handleKeyPress}
            autoFocus
            fullWidth
            variant="outlined"
            margin="normal"
            InputProps={{
              startAdornment: <Folder style={{ color: 'action.active', marginRight: '8px' }} />,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateFolderDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateFolderAndSelect} 
            color="primary" 
            variant="contained" 
            startIcon={<CreateNewFolder />}
          >
            Create and Select
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isPasswordDialogOpen} onClose={() => setIsPasswordDialogOpen(false)}>
        <DialogTitle>
          <Typography variant="h6" component="div" style={{ display: 'flex', alignItems: 'center' }}>
            <Lock style={{ marginRight: '10px' }} />
            Enter Upload Password
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            fullWidth
            variant="outlined"
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsPasswordDialogOpen(false)} 
            color="primary"
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePasswordSubmit} 
            color="primary" 
            variant="contained"
            startIcon={<Check />}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={uploadStatus === 'success' ? 'success' : 'error'} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ImageUpload;
