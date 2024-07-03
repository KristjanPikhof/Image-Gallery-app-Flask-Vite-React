import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemText, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Collapse, Typography, Box } from '@mui/material';
import { ExpandLess, ExpandMore, CreateNewFolder, Close, ArrowUpward, ArrowBack } from '@mui/icons-material';

const MobileSidebar = ({ folders, setCurrentFolder, onCreateFolder, currentFolder, isOpen, setIsOpen }) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [openFolders, setOpenFolders] = useState({});

  const handleCreateFolderSubmit = async () => {
    if (newFolderName) {
      try {
        await onCreateFolder(newFolderName, currentFolder);
        setNewFolderName('');
        setIsCreateFolderDialogOpen(false);
      } catch (error) {
        console.error('Error creating folder:', error);
      }
    }
  };

  const toggleFolder = (folderName) => {
    setOpenFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  const renderFolders = (folderList, depth = 0, parentPath = '') => {
    if (!Array.isArray(folderList)) return null;
    
    return folderList.map((folder) => {
      const fullPath = parentPath ? `${parentPath}/${folder.name}` : folder.name;
      const isSelected = currentFolder === fullPath;
      const hasChildren = folder.children && folder.children.length > 0;
      
      return (
        <React.Fragment key={fullPath}>
          <ListItem
            button
            onClick={() => {
              setCurrentFolder(fullPath);
              if (hasChildren) toggleFolder(fullPath);
            }}
            className={`folder-item ${isSelected ? 'selected' : ''}`}
            style={{ paddingLeft: `${depth * 16}px` }}
          >
            {hasChildren && (
              openFolders[fullPath] ? <ExpandLess /> : <ExpandMore />
            )}
            <ListItemText primary={folder.name} />
          </ListItem>
          {hasChildren && (
            <Collapse in={openFolders[fullPath]} timeout="auto" unmountOnExit>
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
    <>
      <Drawer anchor="left" open={isOpen} onClose={() => setIsOpen(false)}>
        <div style={{ width: '250px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <IconButton onClick={() => setIsCreateFolderDialogOpen(true)}>
              <CreateNewFolder />
            </IconButton>
            <IconButton onClick={() => setIsOpen(false)}>
              <Close />
            </IconButton>
          </div>
          <Box sx={{ padding: '10px', display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={() => setCurrentFolder(currentFolder.split('/').slice(0, -1).join('/'))}
              disabled={!currentFolder || currentFolder === ''}
            >
              <ArrowBack />
            </IconButton>
            <IconButton onClick={() => setCurrentFolder('')}>
            </IconButton>
            <Typography variant="body2" noWrap sx={{ marginLeft: '10px', flexGrow: 1 }}>
              {currentFolder || 'Root'}
            </Typography>
          </Box>
          <List style={{ flexGrow: 1, overflowY: 'auto' }}>
            {folders.length > 0 ? renderFolders(folders) : <ListItem><ListItemText primary="Loading..." /></ListItem>}
          </List>
        </div>
      </Drawer>
      <Dialog open={isCreateFolderDialogOpen} onClose={() => setIsCreateFolderDialogOpen(false)}>
        <DialogTitle>Create Folder</DialogTitle>
        <DialogContent>
          <TextField
            label="Folder Name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            autoFocus
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <IconButton onClick={() => setIsCreateFolderDialogOpen(false)}>
            <Close />
          </IconButton>
          <IconButton onClick={handleCreateFolderSubmit} color="primary">
            <CreateNewFolder />
          </IconButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MobileSidebar;
