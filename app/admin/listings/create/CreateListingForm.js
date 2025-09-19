"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createListingAction } from '@/app/actions';

// The initial state for our form's response
const initialState = { message: null, errors: {}, success: false };

export default function CreateListingForm() {
  // State for the server action's response
  const [formState, setFormState] = useState(initialState);
  // State for managing the actual File objects to be uploaded
  const [selectedFiles, setSelectedFiles] = useState([]);
  // State for the temporary URLs used for previews
  const [previews, setPreviews] = useState([]);
  // State to manually track submission status
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- NEW LOGIC: Handle appending new files ---
  const handleImageChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Append new files to our existing state
      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);

      // Create new preview URLs and append them
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    }

    // Clear the file input so the user can select the same file again if they remove it
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  // --- NEW LOGIC: Handle removing a selected image ---
  const handleRemoveImage = (indexToRemove) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(previews[indexToRemove]);

    // Filter out the removed file and its preview URL
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    setPreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
  };
  
  // --- NEW LOGIC: Manual form submission handler ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormState(initialState); // Reset previous messages

    // 1. Create FormData from the form's text fields
    const formData = new FormData(event.currentTarget);
    
    // 2. Remove the default 'images' entry, as it only holds the last selection
    formData.delete('images');

    // 3. Append all files from our state to the FormData object
    if (selectedFiles.length > 0) {
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });
    }

    // 4. Call the server action with the manually constructed FormData
    const result = await createListingAction(initialState, formData);
    
    setFormState(result);
    setIsSubmitting(false);
  };
  
  // Effect to reset the form after a successful submission
  useEffect(() => {
    if (formState.success) {
      formRef.current?.reset();
      setSelectedFiles([]);
      setPreviews([]);
    }
  }, [formState.success, formRef]);
  
  // A cleanup effect to prevent memory leaks when the component unmounts
  useEffect(() => {
    return () => {
      previews.forEach(URL.revokeObjectURL);
    };
  }, [previews]);

  return (
    // We now use `onSubmit` instead of `action`
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Title & Description Fields (no changes) */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input id="title" name="title" type="text" required className="p-2 mt-1 block w-full rounded-md bg-white border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
        {formState.errors?.title && <p className="mt-2 text-sm text-red-600">{formState.errors.title[0]}</p>}
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea id="description" name="description" rows={4} className="p-2 mt-1 block w-full rounded-md bg-white border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
        {formState.errors?.description && <p className="mt-2 text-sm text-red-600">{formState.errors.description[0]}</p>}
      </div>
      
      {/* Price Field */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
        <input 
          id="price" 
          name="price" 
          type="number" 
          step="0.01" 
          min="0" 
          placeholder="0.00"
          className="p-2 mt-1 block w-full rounded-md bg-white border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {formState.errors?.price && <p className="mt-2 text-sm text-red-600">{formState.errors.price[0]}</p>}
      </div>
      
      {/* Image Upload Field */}
      <div>
        <label htmlFor="images" className="block text-sm font-medium text-gray-700">
          Images (select multiple or add more later)
        </label>
        <input
          id="images"
          name="images"
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
        />
        {formState.errors?.image_urls && <p className="mt-2 text-sm text-red-600">{formState.errors.image_urls[0]}</p>}
      </div>

      {/* Image Preview Grid with Remove Buttons */}
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((src, index) => (
            <div key={index} className="relative group aspect-square w-full rounded-md overflow-hidden border">
              <Image
                src={src}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 p-1 bg-black bg-opacity-40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                aria-label="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Is Available Checkbox (no changes) */}
      <div className="flex items-center gap-3">
        <input id="is_available" name="is_available" type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
        <label htmlFor="is_available" className="text-sm font-medium text-gray-700">Is this listing available?</label>
      </div>
      
      {/* Action Buttons & Messages */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200">
        <div className="flex-grow">
          {formState.message && (
            <p className={`text-sm ${formState.success ? 'text-green-600' : 'text-red-600'}`}>
              {formState.message}
            </p>
          )}
        </div>
        <div className="flex gap-4">
          <Link href="/admin/listings" className="text-sm font-medium text-gray-600 hover:text-gray-900 py-2 px-4 rounded-md">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isSubmitting ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </div>
    </form>
  );
}
