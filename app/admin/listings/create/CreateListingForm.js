"use client";

// NEW: Import useState and ChangeEvent for handling file previews
import { useActionState, useEffect, useRef, useState, ChangeEvent } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image'; // NEW: Use Next.js Image for optimized previews
import { createListingAction } from '@/app/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      {pending ? 'Creating...' : 'Create Listing'}
    </button>
  );
}

export default function CreateListingForm() {
  const initialState = { message: null, errors: {}, success: false };
  const [state, dispatch] = useActionState(createListingAction, initialState);
  const formRef = useRef(null);

  // NEW: State to hold the URLs for the selected image previews
  const [previews, setPreviews] = useState([]);

  // NEW: Handler for when the user selects files
  const handleImageChange = (e) => {
    // Revoke the old URLs to prevent memory leaks
    previews.forEach(URL.revokeObjectURL);

    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Create a temporary, local URL for each selected file
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      // NEW: Clear the image previews on successful submission
      setPreviews([]);
    }
  }, [state.success]);
  
  // NEW: A cleanup effect to prevent memory leaks when the component unmounts
  useEffect(() => {
    return () => {
      previews.forEach(URL.revokeObjectURL);
    };
  }, [previews]);

  return (
    <form ref={formRef} action={dispatch} className="space-y-6">
      {/* Title Field (no changes) */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input id="title" name="title" type="text" required className="p-2 mt-1 block w-full rounded-md bg-white border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
        {state.errors?.title && <p className="mt-2 text-sm text-red-600">{state.errors.title[0]}</p>}
      </div>

      {/* Description Field (no changes) */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea id="description" name="description" rows={4} className="p-2 mt-1 block w-full rounded-md bg-white border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
        {state.errors?.description && <p className="mt-2 text-sm text-red-600">{state.errors.description[0]}</p>}
      </div>
      
      {/* Image Upload Field */}
      <div>
        <label htmlFor="images" className="block text-sm font-medium text-gray-700">Images</label>
        <input
          id="images"
          name="images"
          type="file"
          multiple
          accept="image/*"
          // NEW: Attach the onChange handler
          onChange={handleImageChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
        />
        {state.errors?.image_urls && <p className="mt-2 text-sm text-red-600">{state.errors.image_urls[0]}</p>}
      </div>

      {/* --- NEW: Image Preview Grid --- */}
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((src, index) => (
            <div key={index} className="relative aspect-square w-full rounded-md overflow-hidden border">
              <Image
                src={src}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />
            </div>
          ))}
        </div>
      )}

      {/* Is Available Checkbox (no changes) */}
      <div className="flex items-center gap-3">
        <input id="is_available" name="is_available" type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
        <label htmlFor="is_available" className="text-sm font-medium text-gray-700">Is this listing available?</label>
      </div>
      
      {/* Action Buttons & Messages (no changes) */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200">
        <div className="flex-grow">
          {state.message && (
            <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>
              {state.message}
            </p>
          )}
        </div>
        <div className="flex gap-4">
          <Link href="/admin/listings" className="text-sm font-medium text-gray-600 hover:text-gray-900 py-2 px-4 rounded-md">
            Cancel
          </Link>
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}