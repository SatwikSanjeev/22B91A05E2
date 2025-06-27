// Input validation utilities

// Validate URL format
export const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

// Validate shortcode format (alphanumeric only)
export const isValidShortcode = (shortcode) => {
  if (!shortcode || shortcode.length === 0) return true; // Optional field
  return /^[a-zA-Z0-9]{1,20}$/.test(shortcode);
};

// Validate positive integer
export const isValidPositiveInteger = (value) => {
  const num = parseInt(value, 10);
  return Number.isInteger(num) && num > 0;
};

// Validate form data
export const validateUrlEntry = (originalUrl, customShortcode, validityMinutes) => {
  const errors = {};

  if (!originalUrl) {
    errors.originalUrl = 'URL is required';
  } else if (!isValidUrl(originalUrl)) {
    errors.originalUrl = 'Please enter a valid URL (http:// or https://)';
  }

  if (customShortcode && !isValidShortcode(customShortcode)) {
    errors.customShortcode = 'Shortcode must be alphanumeric (letters and numbers only, max 20 characters)';
  }

  if (validityMinutes && !isValidPositiveInteger(validityMinutes)) {
    errors.validityMinutes = 'Validity must be a positive number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Format URL for display (add protocol if missing)
export const formatUrl = (url) => {
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
};