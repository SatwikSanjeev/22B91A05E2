import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import LinkIcon from '@mui/icons-material/Link';
import BarChartIcon from '@mui/icons-material/BarChart';

const Header = () => {
  const location = useLocation();
  
  return (
    <AppBar position="static" elevation={2} sx={{ mb: 4 }}>
      <Toolbar>
        <LinkIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          URL Shortener
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            variant={location.pathname === '/' ? 'outlined' : 'text'}
            sx={{ 
              color: 'white',
              borderColor: location.pathname === '/' ? 'white' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Shorten URLs
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/statistics"
            variant={location.pathname === '/statistics' ? 'outlined' : 'text'}
            sx={{ 
              color: 'white',
              borderColor: location.pathname === '/statistics' ? 'white' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
            startIcon={<BarChartIcon />}
          >
            Statistics
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;