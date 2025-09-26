"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { updateListingAction, deleteListingAction } from '@/app/actions';
import { set } from 'zod';

export default function EditListingForm({ listing }) {
  const router = useRouter();
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const initialState = { message: null, errors: {}, success: false };

  const [formState, setFormState] = useState(initialState);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteClicked, setDeleteClicked] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentImages, setCurrentImages] = useState(
    listing.image_urls ? JSON.parse(JSON.stringify(listing.image_urls)) : []
  );

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

  const handleRemoveNewImage = (indexToRemove) => {
    URL.revokeObjectURL(previews[indexToRemove]);

    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    setPreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
  };

  const handleRemoveCurrentImage = (indexToRemove) => {
    setCurrentImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  };

  const moveCurrentImage = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    const newImages = [...currentImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setCurrentImages(newImages);
  };

  const handleMoveCurrentUp = (index) => {
    if (index > 0) {
      moveCurrentImage(index, index - 1);
    }
  };

  const handleMoveCurrentDown = (index) => {
    if (index < currentImages.length - 1) {
      moveCurrentImage(index, index + 1);
    }
  };

  const moveNewImage = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];

    const [movedFile] = newFiles.splice(fromIndex, 1);
    const [movedPreview] = newPreviews.splice(fromIndex, 1);

    newFiles.splice(toIndex, 0, movedFile);
    newPreviews.splice(toIndex, 0, movedPreview);

    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleMoveNewUp = (index) => {
    if (index > 0) {
      moveNewImage(index, index - 1);
    }
  };

  const handleMoveNewDown = (index) => {
    if (index < previews.length - 1) {
      moveNewImage(index, index + 1);
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

    formData.append('current_images', JSON.stringify(currentImages));

    const result = await updateListingAction(listing.id, initialState, formData);
    
    setFormState(result);
    setIsSubmitting(false);

    if (result.success) {
      alert('Listing updated successfully!');
      const redirectSlug = result.newSlug || listing.slug;
      router.push(`/admin/listings/${redirectSlug}`);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteModal(false);
    setIsDeleting(true);
    
    try {
      const result = await deleteListingAction(listing.id);
      
      if (result.success) {
        window.location.href = '/admin/listings';
      } else {
        setFormState({ success: false, message: `Error deleting listing: ${result.message}` });
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Delete error:', error);
      setFormState({ success: false, message: 'An unexpected error occurred while deleting the listing.' });
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    return () => {
      previews.forEach(URL.revokeObjectURL);
    };
  }, [previews]);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={listing.title}
          className="p-2 mt-1 block w-full rounded-md bg-white border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {formState.errors?.title && <p className="mt-2 text-sm text-red-600">{formState.errors.title[0]}</p>}
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={listing.description}
          className="p-2 mt-1 block w-full rounded-md bg-white border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
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
          defaultValue={listing.price || ''}
          className="p-2 mt-1 block w-full rounded-md bg-white border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {formState.errors?.price && <p className="mt-2 text-sm text-red-600">{formState.errors.price[0]}</p>}
      </div>

      {/* Current Images Display with Reorder and Remove Controls */}
      {currentImages.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Images</label>
          <div className="mb-2 text-sm text-gray-600">
            {currentImages.length > 1 && "Tap the arrows to reorder images. The first image will be the main thumbnail."}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {currentImages.map((imageUrl, index) => (
              <div key={index} className="relative group border rounded-md overflow-hidden bg-white">
                <div className="aspect-square w-full relative">
                  <Image
                    src={imageUrl}
                    alt={`Current image ${index + 1}`}
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
                    onClick={() => handleRemoveCurrentImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    aria-label="Remove current image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Reorder controls */}
                {currentImages.length > 1 && (
                  <div className="flex justify-center gap-2 p-2 bg-gray-50">
                    <button
                      type="button"
                      onClick={() => handleMoveCurrentUp(index)}
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
                      onClick={() => handleMoveCurrentDown(index)}
                      disabled={index === currentImages.length - 1}
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

      {/* New Image Previews with Reorder and Remove Controls */}
      {previews.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Images to Add</label>
          <div className="mb-2 text-sm text-gray-600">
            {previews.length > 1 && "Tap the arrows to reorder new images. These will be added after current images."}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((src, index) => (
              <div key={index} className="relative group border border-indigo-300 rounded-md overflow-hidden bg-white">
                <div className="aspect-square w-full relative">
                  <Image
                    src={src}
                    alt={`New image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  />
                  {/* Image number indicator */}
                  <div className="absolute top-2 left-2 bg-indigo-600 bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                    New {index + 1}
                  </div>
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveNewImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    aria-label="Remove new image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Reorder controls */}
                {previews.length > 1 && (
                  <div className="flex justify-center gap-2 p-2 bg-indigo-50">
                    <button
                      type="button"
                      onClick={() => handleMoveNewUp(index)}
                      disabled={index === 0}
                      className="flex items-center justify-center w-8 h-8 rounded bg-indigo-100 text-indigo-600 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Move new image left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveNewDown(index)}
                      disabled={index === previews.length - 1}
                      className="flex items-center justify-center w-8 h-8 rounded bg-indigo-100 text-indigo-600 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Move new image right"
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

      {/* Is Available Checkbox */}
      <div className="flex items-center gap-3">
        <input
          id="is_available"
          name="is_available"
          type="checkbox"
          defaultChecked={listing.is_available}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="is_available" className="text-sm font-medium text-gray-700">Is this listing available?</label>
      </div>

      {/* Action Buttons & Messages */}
      <div className="pt-4 border-t border-gray-200">
        {formState.message && (
          <div className="mb-4">
            <p className={`text-sm ${formState.success ? 'text-green-600' : 'text-red-600'}`}>
              {formState.message}
            </p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
          <Link href={`/admin/listings/${listing.slug}`} className="text-sm font-medium text-gray-600 hover:text-gray-900 py-2 px-4 rounded-md text-center sm:text-left">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || isDeleting}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Delete Section */}
      <div className="pt-6 border-t border-red-200">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1 text-center sm:text-left">
              <div className='flex gap-2 justify-center sm:justify-start items-center'>
                <Image src="/black-diamond.png" alt="Black Diamond Icon" width={24} height={24} className="inline-block" />
                <h3 className="text-med font-medium text-black">
                  Black Diamond Zone!!
                </h3>
              </div>
              {!deleteClicked ? (
                <div>
                  <div className="mt-4 text-center sm:text-left">
                    <button
                      type="button"
                      onClick={() => setDeleteClicked(true)}
                      disabled={isSubmitting || isDeleting}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete Listing
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mt-2 text-sm text-red-700 text-center sm:text-left">
                    Are you sure you want to delete this listing? This action cannot be undone.
                  </div>
                  <div className="mt-4 flex justify-center sm:justify-start gap-4">
                    <button
                      type="button"
                      onClick={handleDeleteConfirm}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay 
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleDeleteCancel}
            ></div>

            {/* Modal panel 
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Delete Listing
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete &quot;{listing.title}&quot;? This action cannot be undone and will permanently remove the listing and all associated data.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCancel}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </form>
  );
}
