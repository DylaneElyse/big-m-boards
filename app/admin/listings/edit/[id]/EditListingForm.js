// /app/admin/listings/edit/[id]/EditListingForm.js

"use client";

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateListingAction } from '@/app/actions';

// A reusable submit button that shows a pending state
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      {pending ? 'Saving...' : 'Save Changes'}
    </button>
  );
}

export default function EditListingForm({ listing }) {
  const router = useRouter();
  const initialState = { message: null, errors: {}, success: false };

  // Bind the listing's ID to the server action
  const updateListingWithId = updateListingAction.bind(null, listing.id);
  const [state, dispatch] = useActionState(updateListingWithId, initialState);

  // Effect to handle navigation after a successful update
  useEffect(() => {
    if (state.success) {
      // Give user feedback before redirecting
      alert('Listing updated successfully!'); 
      // Redirect to the slug-based admin view page
      router.push(`/admin/listings/${listing.slug}`);
    }
  }, [state, listing.slug, router]);

  return (
    <form action={dispatch} className="space-y-6">
      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={listing.title} // Pre-populate with existing data
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {state.errors?.title && <p className="mt-2 text-sm text-red-600">{state.errors.title[0]}</p>}
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={listing.description} // Pre-populate with existing data
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {state.errors?.description && <p className="mt-2 text-sm text-red-600">{state.errors.description[0]}</p>}
      </div>

      {/* Is Available Checkbox */}
      <div className="flex items-center gap-3">
        <input
          id="is_available"
          name="is_available"
          type="checkbox"
          defaultChecked={listing.is_available} // Use defaultChecked for checkboxes
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="is_available" className="text-sm font-medium text-gray-700">Is this listing available?</label>
      </div>

      {/* --- Action Buttons & Messages --- */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200">
        <div className="flex-grow">
          {state.message && (
            <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>
              {state.message}
            </p>
          )}
        </div>
        <div className="flex gap-4">
          <Link href={`/admin/listings/${listing.slug}`} className="text-sm font-medium text-gray-600 hover:text-gray-900 py-2 px-4 rounded-md">
            Cancel
          </Link>
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}