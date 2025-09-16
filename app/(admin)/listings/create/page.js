"use client";

// FIX: Import hooks from their correct packages
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createListingAction } from '@/app/actions';

function SubmitButton() {
  // This hook now correctly comes from 'react-dom'
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? 'Creating...' : 'Create Listing'}</button>;
}

export default function NewListingPage() {
  const initialState = { message: null, errors: {} };
  
  // This hook correctly comes from 'react'
  const [state, dispatch] = useActionState(createListingAction, initialState);

  return (
    <form action={dispatch}>
      <h1>Create New Listing</h1>
      
      {/* Title Field */}
      <div>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" required />
        {state.errors?.title && <p style={{color: 'red'}}>{state.errors.title[0]}</p>}
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" />
        {state.errors?.description && <p style={{color: 'red'}}>{state.errors.description[0]}</p>}
      </div>
      
      {/* Image Upload Field */}
      <div>
        <label htmlFor="images">Images</label>
        <input id="images" name="images" type="file" multiple accept="image/*" />
        {state.errors?.image_urls && <p style={{color: 'red'}}>{state.errors.image_urls[0]}</p>}
      </div>

      {/* Is Available Checkbox */}
      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
        <input id="is_available" name="is_available" type="checkbox" defaultChecked />
        <label htmlFor="is_available">Is this listing available?</label>
        {state.errors?.is_available && <p style={{color: 'red'}}>{state.errors.is_available[0]}</p>}
      </div>
      
      <SubmitButton />
      {state.message && <p style={{color: 'red'}}>{state.message}</p>}
    </form>
  );
}