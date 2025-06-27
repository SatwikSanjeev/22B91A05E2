import { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LinkIcon from '@mui/icons-material/Link';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MouseIcon from '@mui/icons-material/Mouse';
import { getStoredUrls, getAnalytics, cleanupExpiredUrls } from '../utils/urlStorage';

const Statistics = () => {
  const [urls, setUrls] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created');
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    loadData();
    // Set up periodic cleanup
    const cleanup = setInterval(() => {
      if (cleanupExpiredUrls()) {
        loadData();
      }
    }, 60000); // Check every minute

    return () => clearInterval(cleanup);
  }, []);

  const loadData = () => {
    cleanupExpiredUrls();
    setUrls(getStoredUrls());
    setAnalytics(getAnalytics());
  };

  const toggleRowExpansion = (shortcode) => {
    setExpandedRows(prev => ({
      ...prev,
      [shortcode]: !prev[shortcode]
    }));
  };

  const filterAndSortUrls = () => {
    const urlArray = Object.values(urls);
    
    // Filter by search term
    const filtered = urlArray.filter(url => 
      url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.shortcode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by selected criteria
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return b.createdAt - a.createdAt;
        case 'clicks':
          const aClicks = analytics[a.shortcode]?.totalClicks || 0;
          const bClicks = analytics[b.shortcode]?.totalClicks || 0;
          return bClicks - aClicks;
        case 'expiry':
          if (!a.expiryTime && !b.expiryTime) return 0;
          if (!a.expiryTime) return 1;
          if (!b.expiryTime) return -1;
          return a.expiryTime - b.expiryTime;
        default:
          return 0;
      }
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTimeUntilExpiry = (expiryTime) => {
    if (!expiryTime) return 'Never expires';
    
    const now = Date.now();
    const timeLeft = expiryTime - now;
    
    if (timeLeft <= 0) return 'Expired';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getShortUrl = (shortcode) => {
    return `${window.location.origin}/${shortcode}`;
  };

  const filteredUrls = filterAndSortUrls();
  const totalUrls = Object.keys(urls).length;
  const totalClicks = Object.values(analytics).reduce((sum, data) => sum + (data.totalClicks || 0), 0);
  const activeUrls = Object.values(urls).filter(url => !url.expiryTime || url.expiryTime > Date.now()).length;

  return (
    <Container maxWidth="lg">
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ p: 2, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LinkIcon sx={{ mr: 2, fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {totalUrls}
                </Typography>
                <Typography variant="body1">
                  Total URLs
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ p: 2, backgroundColor: 'success.light', color: 'success.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MouseIcon sx={{ mr: 2, fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {totalClicks}
                </Typography>
                <Typography variant="body1">
                  Total Clicks
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ p: 2, backgroundColor: 'info.light', color: 'info.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon sx={{ mr: 2, fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {activeUrls}
                </Typography>
                <Typography variant="body1">
                  Active URLs
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Main Statistics Card */}
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <BarChartIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1">
              URL Statistics
            </Typography>
          </Box>

          {totalUrls === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No URLs have been shortened yet. Go to the home page to create your first shortened URL!
            </Alert>
          ) : (
            <>
              {/* Search and Filter Controls */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                  label="Search URLs"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flex: 1, minWidth: 250 }}
                />
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Sort by</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort by"
                  >
                    <MenuItem value="created">Created Date</MenuItem>
                    <MenuItem value="clicks">Click Count</MenuItem>
                    <MenuItem value="expiry">Expiry Time</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* URL Statistics Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell width="40"></TableCell>
                      <TableCell><strong>Short URL</strong></TableCell>
                      <TableCell><strong>Original URL</strong></TableCell>
                      <TableCell align="center"><strong>Clicks</strong></TableCell>
                      <TableCell><strong>Created</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUrls.map((url) => {
                      const urlAnalytics = analytics[url.shortcode] || { clicks: [], totalClicks: 0 };
                      const isExpanded = expandedRows[url.shortcode];
                      const isExpired = url.expiryTime && Date.now() > url.expiryTime;

                      return (
                        <>
                          <TableRow 
                            key={url.shortcode}
                            sx={{ 
                              '&:hover': { backgroundColor: 'grey.50' },
                              opacity: isExpired ? 0.6 : 1
                            }}
                          >
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => toggleRowExpansion(url.shortcode)}
                              >
                                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                            </TableCell>
                            <TableCell>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: 'monospace',
                                  color: 'primary.main',
                                  fontWeight: 'medium'
                                }}
                              >
                                {getShortUrl(url.shortcode)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  maxWidth: 300,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                                title={url.originalUrl}
                              >
                                {url.originalUrl}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={urlAnalytics.totalClicks} 
                                color="primary" 
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatTime(url.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getTimeUntilExpiry(url.expiryTime)}
                                color={isExpired ? 'error' : url.expiryTime ? 'warning' : 'success'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                          
                          {/* Expanded Row - Click Details */}
                          <TableRow>
                            <TableCell colSpan={6} sx={{ p: 0 }}>
                              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
                                  <Typography variant="h6" gutterBottom>
                                    Click Analytics for {url.shortcode}
                                  </Typography>
                                  
                                  {urlAnalytics.clicks.length === 0 ? (
                                    <Alert severity="info">No clicks recorded yet</Alert>
                                  ) : (
                                    <TableContainer component={Paper} variant="outlined">
                                      <Table size="small">
                                        <TableHead>
                                          <TableRow>
                                            <TableCell><strong>Timestamp</strong></TableCell>
                                            <TableCell><strong>Referrer</strong></TableCell>
                                            <TableCell><strong>Location</strong></TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {urlAnalytics.clicks.slice().reverse().map((click, index) => (
                                            <TableRow key={index}>
                                              <TableCell>
                                                {formatTime(click.timestamp)}
                                              </TableCell>
                                              <TableCell>
                                                <Typography variant="body2">
                                                  {click.referrer || 'Direct'}
                                                </Typography>
                                              </TableCell>
                                              <TableCell>
                                                <Typography variant="body2">
                                                  {click.timezone || 'Unknown'}
                                                </Typography>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  )}
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {filteredUrls.length === 0 && searchTerm && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No URLs found matching "{searchTerm}". Try a different search term.
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Statistics;