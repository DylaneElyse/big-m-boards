"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createListingAction } from '@/app/actions';

const initialState = { message: null, errors: {}, success: false };

export default function CreateListingForm() {
  const [formState, setFormState] = useState(initialState);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);

      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    }

    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    URL.revokeObjectURL(previews[indexToRemove]);

    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    setPreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
  };

  const moveImage = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];

    // Move the items
    const [movedFile] = newFiles.splice(fromIndex, 1);
    const [movedPreview] = newPreviews.splice(fromIndex, 1);

    newFiles.splice(toIndex, 0, movedFile);
    newPreviews.splice(toIndex, 0, movedPreview);

    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      moveImage(index, index - 1);
    }
  };

  const handleMoveDown = (index) => {
    if (index < previews.length - 1) {
      moveImage(index, index + 1);
    }
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormState(initialState); 

    const formData = new FormData(event.currentTarget);
    
    formData.delete('images');

    if (selectedFiles.length > 0) {
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });
    }

    const result = await createListingAction(initialState, formData);
    
    setFormState(result);
    setIsSubmitting(false);
  };
  
  useEffect(() => {
    if (formState.success) {
      formRef.current?.reset();
      setSelectedFiles([]);
      setPreviews([]);
    }
  }, [formState.success, formRef]);
  
  useEffect(() => {
    return () => {
      previews.forEach(URL.revokeObjectURL);
    };
  }, [previews]);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Title & Description Fields */}
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
        <p className="mt-1 text-xs text-gray-500">
          Supported formats: JPEG, PNG, GIF, WebP. Maximum file size: 10MB per image.
        </p>
        {formState.errors?.image_urls && <p className="mt-2 text-sm text-red-600">{formState.errors.image_urls[0]}</p>}
      </div>

      {/* Image Preview Grid with Reorder and Remove Controls */}
      {previews.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-sm text-gray-600">
            {previews.length > 1 && "Tap the arrows to reorder images. The first image will be the main thumbnail."}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((src, index) => (
              <div key={index} className="relative group border rounded-md overflow-hidden bg-white">
                <div className="aspect-square w-full relative">
                  <Image
                    src={src}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  />
                  {/* Image number indicator */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    aria-label="Remove image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Reorder controls */}
                {previews.length > 1 && (
                  <div className="flex justify-center gap-2 p-2 bg-gray-50">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="flex items-center justify-center w-8 h-8 rounded bg-indigo-100 text-indigo-600 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Move image left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === previews.length - 1}
                      className="flex items-center justify-center w-8 h-8 rounded bg-indigo-100 text-indigo-600 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Move image right"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
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
