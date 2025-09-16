/**
 * A simple sanitizer that trims whitespace.
 * For more robust needs (like preventing XSS), consider a library like DOMPurify
 * when rendering user-generated content as HTML. For basic form inputs that are
 * treated as strings, trimming is often sufficient.
 * @param {string} value - The input value to sanitize.
 * @returns {string} - The sanitized value.
 */
export const sanitizeInput = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

// --- Validation Rule Creators ---
// These are functions that return the actual validation function.
// This pattern allows us to pass arguments like a custom message or a minimum length.

/**
 * Rule: Checks if the value is not empty.
 * @param {string} message - Custom error message.
 * @returns {function(string): string|null} - A validation function.
 */
export const required = (message = 'This field is required') => (value) => {
  return value ? null : message;
};

/**
 * Rule: Checks if the value is a valid email format.
 * @param {string} message - Custom error message.
 * @returns {function(string): string|null} - A validation function.
 */
export const isEmail = (message = 'Please enter a valid email address') => (value) => {
  if (!value) return null; // Don't run on empty value, let `required` handle that.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value) ? null : message;
};

/**
 * Rule: Checks if the value meets a minimum length.
 * @param {number} min - The minimum required length.
 * @param {string} message - Custom error message.
 * @returns {function(string): string|null} - A validation function.
 */
export const minLength = (min, message) => (value) => {
  if (!value) return null;
  const defaultMessage = `Must be at least ${min} characters long`;
  return value.length >= min ? null : (message || defaultMessage);
};