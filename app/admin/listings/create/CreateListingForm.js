"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Sortable from 'sortablejs'; // REFACTOR: Import SortableJS
import imageCompression from 'browser-image-compression';
import { createListingAction } from '@/app/actions';

const initialState = { message: null, errors: {}, success: false };

export default function CreateListingForm() {
  const [formState, setFormState] = useState(initialState);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');

  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageGridRef = useRef(null); // REFACTOR: Add a ref for the grid container

  // REFACTOR: Optimized SortableJS configuration for mobile
  useEffect(() => {
    if (imageGridRef.current && previews.length > 1) {
      const sortable = new Sortable(imageGridRef.current, {
        animation: 200,
        delay: 150, // Reduced delay for better responsiveness
        delayOnTouchOnly: true,
        touchStartThreshold: 3, // Pixels to move before starting drag
        
        // Mobile-optimized settings
        forceFallback: false, // Use native HTML5 drag when possible
        fallbackTolerance: 3,
        dragoverBubble: false,
        removeCloneOnHide: true,
        
        // Visual feedback
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        
        // Prevent conflicts with other interactions
        preventOnFilter: false,
        filter: '.no-drag', // Elements with this class won't be draggable
        
        // Improved touch handling
        scroll: true,
        scrollSensitivity: 30,
        scrollSpeed: 10,

        // When the user is done dragging
        onEnd: (evt) => {
          const { oldIndex, newIndex } = evt;

          // If the item was actually moved
          if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
            // Update the files array
            const newFiles = [...selectedFiles];
            const [movedFile] = newFiles.splice(oldIndex, 1);
            newFiles.splice(newIndex, 0, movedFile);
            setSelectedFiles(newFiles);
            
            // Update the previews array
            const newPreviews = [...previews];
            const [movedPreview] = newPreviews.splice(oldIndex, 1);
            newPreviews.splice(newIndex, 0, movedPreview);
            setPreviews(newPreviews);
          }
        },
      });

      // Cleanup function to destroy the instance when the component unmounts
      return () => {
        sortable.destroy();
      };
    }
  }, [previews, selectedFiles]); // Rerun when previews change


  // --- Enhanced image handling with compression ---
  const handleImageChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setUploading(true);
    const newFiles = [];
    const newPreviews = [];

    // Use a for loop to handle async operations sequentially
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        setProgress(`Compressing image ${i + 1} of ${files.length}...`);

        // Compression options
        const options = {
          maxSizeMB: 1,              // Max file size
          maxWidthOrHeight: 1920,    // Max dimensions
          useWebWorker: true,        // Use a web worker for better performance
          fileType: 'image/jpeg',    // Force output to JPEG
        };
        
        const compressedFile = await imageCompression(file, options);
        
        // Create a new File object with the compressed blob
        const compressedFileWithName = new File(
          [compressedFile], 
          file.name.replace(/\.[^/.]+$/, '.jpg'), // Change extension to .jpg
          { type: 'image/jpeg' }
        );

        newFiles.push(compressedFileWithName);
        const preview = URL.createObjectURL(compressedFile);
        newPreviews.push(preview);

      } catch (error) {
        console.error('Error compressing file:', error.message);
        alert(`Failed to compress ${file.name}. Please try again.`);
        // Continue with other files instead of breaking
      }
    }

    setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
    setPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    setUploading(false);
    setProgress('');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    URL.revokeObjectURL(previews[indexToRemove]);
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    setPreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
  };
  
  // REFACTOR: We can delete all of these states and handlers!
  // const [draggedIndex, setDraggedIndex] = useState(null);
  // const [selectedIndex, setSelectedIndex] = useState(null);
  // const [isMobile, setIsMobile] = useState(false);
  // useEffect for detecting mobile... (no longer needed)
  // const moveImage = ... (SortableJS handles this)
  // const handleDragStart = ...
  // const handleDragOver = ...
  // const handleDrop = ...
  // const handleImageClick = ...
  // const handleMoveUp = ...
  // const handleMoveDown = ...
  
  // --- Form submission logic remains the same ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormState(initialState); 

    const formData = new FormData(event.currentTarget);
    formData.delete('images');

    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

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
  }, [formState.success]);
  
  useEffect(() => {
    return () => {
      previews.forEach(URL.revokeObjectURL);
    };
  }, [previews]);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* --- Title, Description, Price, Image Upload Fields (NO CHANGES) --- */}
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
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
        <input id="price" name="price" type="number" step="0.01" min="0" placeholder="0.00" className="p-2 mt-1 block w-full rounded-md bg-white border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
        {formState.errors?.price && <p className="mt-2 text-sm text-red-600">{formState.errors.price[0]}</p>}
      </div>
      <div>
        <label htmlFor="images" className="block text-sm font-medium text-gray-700">Images (select multiple or add more later)</label>
        <input 
          id="images" 
          name="images" 
          type="file" 
          multiple 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleImageChange} 
          disabled={uploading}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 disabled:opacity-50"
        />
        <p className="mt-1 text-xs text-gray-500">Images will be automatically compressed. Supported formats: JPEG, PNG, GIF, WebP.</p>
        {uploading && <p className="mt-2 text-sm text-indigo-600">{progress}</p>}
        {formState.errors?.image_urls && <p className="mt-2 text-sm text-red-600">{formState.errors.image_urls[0]}</p>}
      </div>

      {/* REFACTOR: Simplified Image Preview Grid */}
      {previews.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-sm text-gray-600">
            {previews.length > 1 && "Long-press (or click and drag) to reorder images. The first image is the cover."}
          </div>
          <div ref={imageGridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
            {previews.map((src, index) => (
              <div
                key={src} // Using the src as a key is better if it's guaranteed unique
                className={`relative group border rounded-md overflow-hidden bg-white transition-shadow duration-200 ${previews.length > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                <div className="aspect-square w-full relative">
                  <Image src={src} alt={`Preview ${index + 1}`} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"/>
                  <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemoveImage(index); }}
                    className="no-drag absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 touch-target"
                    aria-label="Remove image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* --- Is Available Checkbox & Action Buttons (NO CHANGES) --- */}
      <div className="flex items-center gap-3">
        <input id="is_available" name="is_available" type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
        <label htmlFor="is_available" className="text-sm font-medium text-gray-700">Is this listing available?</label>
      </div>
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200">
        <div className="flex-grow">
          {formState.message && (<p className={`text-sm ${formState.success ? 'text-green-600' : 'text-red-600'}`}>{formState.message}</p>)}
        </div>
        <div className="flex gap-4">
          <Link href="/admin/listings" className="text-sm font-medium text-gray-600 hover:text-gray-900 py-2 px-4 rounded-md">Cancel</Link>
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            {isSubmitting ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </div>
    </form>
  );
}
