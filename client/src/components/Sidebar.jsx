import React, { useState } from 'react';
import { List, ListItem, ListItemText, IconButton, TextField, Collapse, Box, Typography } from '@mui/material';
import { ExpandLess, ExpandMore, CreateNewFolder, ArrowBack, ArrowBackIos } from '@mui/icons-material';

const Sidebar = ({ folders, setCurrentFolder, onCreateFolder, currentFolder }) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [openFolders, setOpenFolders] = useState({});

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

  const handleCreateFolder = async () => {
    if (newFolderName) {
      try {
        await onCreateFolder(newFolderName, currentFolder);
        setNewFolderName('');
      } catch (error) {
        console.error('Error creating folder:', error);
      }
    }
  };

  return (
    <Box className="sidebar" sx={{ width: '250px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ padding: '10px', display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => setCurrentFolder(currentFolder.split('/').slice(0, -1).join('/'))}>
          <ArrowBack />
        </IconButton>
        <Typography variant="body2" noWrap sx={{ marginLeft: '10px', flexGrow: 1 }}>
          {currentFolder || 'Root'}
        </Typography>
      </Box>
      <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {renderFolders(folders)}
      </List>
      <Box sx={{ display: 'flex', padding: '10px' }}>
        <TextField
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="New folder"
          size="small"
          sx={{ flexGrow: 1, marginRight: '10px' }}
        />
        <IconButton onClick={handleCreateFolder} color="primary">
          <CreateNewFolder />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Sidebar;
