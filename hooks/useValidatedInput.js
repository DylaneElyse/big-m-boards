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

  const validate = useCallback((currentValue) => {
    for (const rule of rules) {
      const errorMessage = rule(currentValue);
      if (errorMessage) {
        setError(errorMessage);
        return false; 
      }
    }
    setError(null);
    return true;
  }, [rules]);

  const onChange = useCallback((e) => {
    const rawValue = e.target.value;
    const sanitizedValue = sanitizeInput(rawValue);
    setValue(sanitizedValue);
    
    if (isTouched) {
      validate(sanitizedValue);
    }
  }, [isTouched, validate]);

  const onBlur = useCallback(() => {
    setIsTouched(true);
    validate(value);
  }, [value, validate]);
  
  const runValidation = useCallback(() => {
    setIsTouched(true);
    return validate(value);
  }, [value, validate]);

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
    validate: runValidation,
    reset,
  };
};