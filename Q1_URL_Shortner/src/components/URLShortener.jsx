import { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  Snackbar,
  IconButton,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ContentCopy as CopyIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { addUrl, cleanupExpiredUrls } from '../utils/urlStorage';
import { validateUrlEntry, formatUrl } from '../utils/validation';

const URLShortener = () => {
  const [urlEntries, setUrlEntries] = useState([
    { originalUrl: '', customShortcode: '', validityMinutes: 30 }
  ]);
  const [shortenedUrls, setShortenedUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Clean up expired URLs on component mount
    cleanupExpiredUrls();
  }, []);

  const addUrlEntry = () => {
    if (urlEntries.length < 5) {
      setUrlEntries([...urlEntries, { originalUrl: '', customShortcode: '', validityMinutes: 30 }]);
    }
  };

  const removeUrlEntry = (index) => {
    if (urlEntries.length > 1) {
      const newEntries = urlEntries.filter((_, i) => i !== index);
      setUrlEntries(newEntries);
      
      // Clean up errors for removed entry
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`${index}_`)) {
          delete newErrors[key];
        }
      });
      // Reindex remaining errors
      const reindexedErrors = {};
      Object.keys(newErrors).forEach(key => {
        const [entryIndex, field] = key.split('_');
        const idx = parseInt(entryIndex);
        if (idx > index) {
          reindexedErrors[`${idx - 1}_${field}`] = newErrors[key];
        } else if (idx < index) {
          reindexedErrors[key] = newErrors[key];
        }
      });
      setErrors(reindexedErrors);
    }
  };

  const updateUrlEntry = (index, field, value) => {
    const newEntries = [...urlEntries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setUrlEntries(newEntries);

    // Clear error for this field
    const errorKey = `${index}_${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const newErrors = {};
    const results = [];
    
    // Validate all entries
    for (let i = 0; i < urlEntries.length; i++) {
      const entry = urlEntries[i];
      if (!entry.originalUrl) continue; // Skip empty entries
      
      const validation = validateUrlEntry(
        entry.originalUrl,
        entry.customShortcode,
        entry.validityMinutes
      );
      
      if (!validation.isValid) {
        Object.keys(validation.errors).forEach(field => {
          newErrors[`${i}_${field}`] = validation.errors[field];
        });
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Please fix the validation errors',
        severity: 'error'
      });
      return;
    }

    // Process valid entries
    for (let i = 0; i < urlEntries.length; i++) {
      const entry = urlEntries[i];
      if (!entry.originalUrl) continue;

      try {
        const formattedUrl = formatUrl(entry.originalUrl);
        const result = addUrl(
          formattedUrl,
          entry.customShortcode,
          entry.validityMinutes || 30
        );
        results.push(result);
      } catch (error) {
        newErrors[`${i}_customShortcode`] = error.message;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    setShortenedUrls(results);
    setUrlEntries([{ originalUrl: '', customShortcode: '', validityMinutes: 30 }]);
    setLoading(false);
    setSnackbar({
      open: true,
      message: `Successfully shortened ${results.length} URL${results.length > 1 ? 's' : ''}!`,
      severity: 'success'
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: 'Copied to clipboard!',
      severity: 'success'
    });
  };

  const getShortUrl = (shortcode) => {
    return `${window.location.origin}/${shortcode}`;
  };

  const formatExpiryTime = (expiryTime) => {
    if (!expiryTime) return 'Never expires';
    return new Date(expiryTime).toLocaleString();
  };

  return (
    <Container maxWidth="lg">
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <LinkIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" gutterBottom>
              URL Shortener
            </Typography>
          </Box>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Shorten up to 5 URLs at once. Set custom shortcodes and expiry times for each URL.
          </Typography>

          {urlEntries.map((entry, index) => (
            <Card 
              key={index} 
              variant="outlined" 
              sx={{ 
                mb: 3, 
                p: 2,
                backgroundColor: 'grey.50',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'grey.100',
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="primary">
                  URL #{index + 1}
                </Typography>
                {urlEntries.length > 1 && (
                  <IconButton 
                    onClick={() => removeUrlEntry(index)}
                    color="error"
                    size="small"
                  >
                    <RemoveIcon />
                  </IconButton>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Original URL *"
                    placeholder="https://example.com"
                    value={entry.originalUrl}
                    onChange={(e) => updateUrlEntry(index, 'originalUrl', e.target.value)}
                    error={!!errors[`${index}_originalUrl`]}
                    helperText={errors[`${index}_originalUrl`]}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Custom Shortcode"
                    placeholder="abc123"
                    value={entry.customShortcode}
                    onChange={(e) => updateUrlEntry(index, 'customShortcode', e.target.value)}
                    error={!!errors[`${index}_customShortcode`]}
                    helperText={errors[`${index}_customShortcode`] || 'Optional, alphanumeric only'}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Validity (minutes)"
                    type="number"
                    value={entry.validityMinutes}
                    onChange={(e) => updateUrlEntry(index, 'validityMinutes', e.target.value)}
                    error={!!errors[`${index}_validityMinutes`]}
                    helperText={errors[`${index}_validityMinutes`] || 'Default: 30 minutes'}
                    variant="outlined"
                    inputProps={{ min: 1 }}
                  />
                </Grid>
              </Grid>
            </Card>
          ))}

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            {urlEntries.length < 5 && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addUrlEntry}
                sx={{ mr: 2 }}
              >
                Add Another URL
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || urlEntries.every(entry => !entry.originalUrl)}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Shorten URLs'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {shortenedUrls.length > 0 && (
        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Shortened URLs
            </Typography>
            
            {shortenedUrls.map((url, index) => (
              <Box key={url.shortcode}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    p: 3, 
                    mb: 2,
                    backgroundColor: 'success.light',
                    color: 'success.contrastText',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Short URL
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontFamily: 'monospace',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            p: 1,
                            borderRadius: 1,
                            flex: 1
                          }}
                        >
                          {getShortUrl(url.shortcode)}
                        </Typography>
                        <IconButton
                          onClick={() => copyToClipboard(getShortUrl(url.shortcode))}
                          sx={{ color: 'inherit' }}
                        >
                          <CopyIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Original URL
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          wordBreak: 'break-all',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          p: 1,
                          borderRadius: 1
                        }}
                      >
                        {url.originalUrl}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={`Expires: ${formatExpiryTime(url.expiryTime)}`}
                          size="small"
                          sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                        />
                        <Chip 
                          label={`Created: ${new Date(url.createdAt).toLocaleString()}`}
                          size="small"
                          sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
                {index < shortenedUrls.length - 1 && <Divider sx={{ my: 2 }} />}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default URLShortener;