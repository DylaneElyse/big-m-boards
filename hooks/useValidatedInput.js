"use client";

import { useState, useCallback } from 'react';
import { sanitizeInput } from '@/utils/formValidator';

/**
 * A custom hook to manage input state, validation, and sanitization.
 * @param {string} initialValue - The starting value for the input.
 * @param {Array<Function>} rules - An array of validation functions (from formValidator.js).
 * @returns {object} - State and handlers for the input field.
 */
export const useValidatedInput = (initialValue = '', rules = []) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(null);
  const [isTouched, setIsTouched] = useState(false);

  // The main validation function for this hook instance
  const validate = useCallback((currentValue) => {
    for (const rule of rules) {
      const errorMessage = rule(currentValue);
      if (errorMessage) {
        setError(errorMessage);
        return false; // Validation failed
      }
    }
    setError(null);
    return true; // Validation passed
  }, [rules]);

  // Handler for the input's onChange event
  const onChange = useCallback((e) => {
    const rawValue = e.target.value;
    const sanitizedValue = sanitizeInput(rawValue);
    setValue(sanitizedValue);
    
    // Validate on change only after the field has been "touched"
    if (isTouched) {
      validate(sanitizedValue);
    }
  }, [isTouched, validate]);

  // Handler for the input's onBlur event (when user clicks away)
  const onBlur = useCallback(() => {
    setIsTouched(true);
    validate(value);
  }, [value, validate]);
  
  // Function to manually trigger validation and set touched state
  const runValidation = useCallback(() => {
    setIsTouched(true);
    return validate(value);
  }, [value, validate]);

  // Function to reset the input field to its initial state
  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setIsTouched(false);
  }, [initialValue]);

  return {
    value,
    error,
    isTouched,
    onChange,
    onBlur,
    validate: runValidation, // Expose the manual validation trigger
    reset,
  };
};