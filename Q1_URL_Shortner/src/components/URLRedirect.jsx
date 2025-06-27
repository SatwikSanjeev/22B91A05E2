import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, CardContent, Typography, CircularProgress, Alert, Box } from '@mui/material';
import { LinkOff as LinkOffIcon, Link as LinkIcon } from '@mui/icons-material';
import { getUrlByShortcode, recordClick } from '../utils/urlStorage';

const URLRedirect = () => {
  const { shortcode } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const urlData = getUrlByShortcode(shortcode);
        
        if (!urlData) {
          setError('URL not found. This link may have expired or never existed.');
          setLoading(false);
          return;
        }

        // Check if URL has expired
        if (urlData.expiryTime && Date.now() > urlData.expiryTime) {
          setError('This URL has expired and is no longer available.');
          setLoading(false);
          return;
        }

        // Record the click
        const referrer = document.referrer;
        recordClick(shortcode, referrer);

        setRedirecting(true);
        
        // Small delay to show the redirecting message
        setTimeout(() => {
          window.location.href = urlData.originalUrl;
        }, 1500);

      } catch (err) {
        setError('An error occurred while processing the redirect.');
        setLoading(false);
      }
    };

    if (shortcode) {
      handleRedirect();
    } else {
      setError('Invalid URL format.');
      setLoading(false);
    }
  }, [shortcode]);

  if (loading && !redirecting) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Processing Link...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Looking up your shortened URL
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (redirecting) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card elevation={3} sx={{ backgroundColor: 'success.light' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <LinkIcon sx={{ fontSize: 60, color: 'success.main' }} />
            </Box>
            <Typography variant="h5" gutterBottom sx={{ color: 'success.contrastText' }}>
              Redirecting...
            </Typography>
            <Typography variant="body1" sx={{ color: 'success.contrastText', mb: 3 }}>
              You will be redirected to your destination shortly.
            </Typography>
            <CircularProgress sx={{ color: 'success.contrastText' }} />
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <LinkOffIcon sx={{ fontSize: 60, color: 'error.main', mb: 3 }} />
            <Typography variant="h5" gutterBottom color="error">
              Link Not Found
            </Typography>
            <Alert severity="error" sx={{ mt: 2, mb: 3 }}>
              {error}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Please check the URL and try again, or contact the person who shared this link.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return null;
};

export default URLRedirect;