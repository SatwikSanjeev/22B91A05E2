// URL Storage utilities for localStorage management
export const URL_STORAGE_KEY = 'urlShortener_urls';
export const ANALYTICS_STORAGE_KEY = 'urlShortener_analytics';

// Generate random shortcode
export const generateShortcode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Get all URLs from localStorage
export const getStoredUrls = () => {
  try {
    const stored = localStorage.getItem(URL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading URLs from storage:', error);
    return {};
  }
};

// Save URLs to localStorage
export const saveUrls = (urls) => {
  try {
    localStorage.setItem(URL_STORAGE_KEY, JSON.stringify(urls));
  } catch (error) {
    console.error('Error saving URLs to storage:', error);
  }
};

// Get analytics data
export const getAnalytics = () => {
  try {
    const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading analytics from storage:', error);
    return {};
  }
};

// Save analytics data
export const saveAnalytics = (analytics) => {
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(analytics));
  } catch (error) {
    console.error('Error saving analytics to storage:', error);
  }
};

// Clean up expired URLs
export const cleanupExpiredUrls = () => {
  const urls = getStoredUrls();
  const analytics = getAnalytics();
  const now = Date.now();
  let hasChanges = false;

  Object.keys(urls).forEach(shortcode => {
    const url = urls[shortcode];
    if (url.expiryTime && now > url.expiryTime) {
      delete urls[shortcode];
      delete analytics[shortcode];
      hasChanges = true;
    }
  });

  if (hasChanges) {
    saveUrls(urls);
    saveAnalytics(analytics);
  }

  return hasChanges;
};

// Add new URL
export const addUrl = (originalUrl, customShortcode, validityMinutes = 30) => {
  const urls = getStoredUrls();
  const shortcode = customShortcode || generateShortcode();
  
  // Check if shortcode already exists
  if (urls[shortcode]) {
    throw new Error('Shortcode already exists');
  }

  const now = Date.now();
  const expiryTime = validityMinutes > 0 ? now + (validityMinutes * 60 * 1000) : null;

  const urlData = {
    originalUrl,
    shortcode,
    createdAt: now,
    expiryTime,
    validityMinutes
  };

  urls[shortcode] = urlData;
  saveUrls(urls);

  // Initialize analytics for this URL
  const analytics = getAnalytics();
  analytics[shortcode] = {
    clicks: [],
    totalClicks: 0
  };
  saveAnalytics(analytics);

  return urlData;
};

// Get URL by shortcode
export const getUrlByShortcode = (shortcode) => {
  const urls = getStoredUrls();
  return urls[shortcode] || null;
};

// Record click analytics
export const recordClick = (shortcode, referrer = '') => {
  const analytics = getAnalytics();
  const now = Date.now();
  
  if (!analytics[shortcode]) {
    analytics[shortcode] = {
      clicks: [],
      totalClicks: 0
    };
  }

  // Simple geolocation approximation (just timezone)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const clickData = {
    timestamp: now,
    referrer: referrer || 'Direct',
    userAgent: navigator.userAgent,
    timezone
  };

  analytics[shortcode].clicks.push(clickData);
  analytics[shortcode].totalClicks += 1;
  
  saveAnalytics(analytics);
  return clickData;
};