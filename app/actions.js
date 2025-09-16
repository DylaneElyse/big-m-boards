'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import {
  createListing,
  updateListing,
  deleteListing,
  listingSchema,
} from '@/lib/supabase/api';

export async function createListingAction(prevState, formData) {
  // 1. Create the client ONCE for the entire action.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("Server Action failed: No authenticated user found.");
    return { message: 'Authentication Error: You must be logged in to create a listing.' };
  }
  
  console.log("Server Action initiated by user:", user.email);

  // --- File Upload Logic (no changes here) ---
  const images = formData.getAll('images').filter(file => file.size > 0);
  const imageUrls = [];

  if (images.length > 0) {
    for (const image of images) {
      const fileName = `${Date.now()}-${image.name}`;
      const { data, error } = await supabase.storage
        .from('listing-images') 
        .upload(fileName, image);

      if (error) {
        console.error('Storage Error:', error);
        return { message: 'Failed to upload image.' };
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(data.path);
        
      imageUrls.push(publicUrl);
    }
  }

  // --- Prepare and Validate Data (no changes here) ---
  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    is_available: formData.get('is_available') === 'on',
    image_urls: imageUrls.length > 0 ? imageUrls : null,
    user_id: user.id,
  };

  const validatedFields = listingSchema.safeParse(rawData);
  
  if (!validatedFields.success) {
    console.error("Validation Failed:", validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 3. Call the API function to insert data
  try {
    console.log("Creating listing with data:", validatedFields.data);
    console.log("Authenticated user ID:", user.id);
    console.log("User ID in listing data:", validatedFields.data.user_id);
    console.log("User IDs match:", user.id === validatedFields.data.user_id);
    
    // Debug: Test a simple query to see if auth context works
    const { data: authTest, error: authError } = await supabase
      .from('listings')
      .select('id')
      .limit(1);
    
    if (authError) {
      console.log("Auth context test error:", authError);
    } else {
      console.log("Auth context test successful:", authTest);
    }
    
    // Debug: Test if we can query our own listings
    const { data: ownListings, error: ownError } = await supabase
      .from('listings')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);
    
    if (ownError) {
      console.log("Own listings query error:", ownError);
    } else {
      console.log("Own listings query successful:", ownListings);
    }
    
    // THE FIX: Pass the existing, authenticated `supabase` client to the function.
    await createListing(supabase, validatedFields.data); 

  } catch (error) {
    console.error("Full error object:", error);
    return { message: `Database Error: ${error.message}` };
  }

  // 4. Revalidate and redirect
  console.log("Listing created successfully. Revalidating paths and redirecting.");
  revalidatePath('/admin/listings');
  redirect('/admin/listings');
}


// --- UPDATE AND DELETE ACTIONS (Also updated) ---

export async function updateListingAction(id, prevState, formData) {
  // THE FIX: Create the client once and check for an authenticated user.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'Authentication Error: You must be logged in to update a listing.' };
  }

  // --- Validation Logic ---
  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    is_available: formData.get('is_available') === 'on',
  };
  // Note: We use .partial() because the user_id is not being updated here.
  const validatedFields = listingSchema.partial().safeParse(rawData);
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  
  try {
    // THE FIX: Pass the authenticated `supabase` client to the update function.
    await updateListing(supabase, id, validatedFields.data);
  } catch (error) {
    return { message: `Database Error: ${error.message}` };
  }

  revalidatePath('/admin/listings');
  revalidatePath(`/admin/listings/${id}`);
  redirect('/listings');
}

export async function deleteListingAction(id) {
  // THE FIX: Create the client once and check for an authenticated user.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Authentication Error: You must be logged in to delete a listing.' };
  }

  try {
    // THE FIX: Pass the authenticated `supabase` client to the delete function.
    await deleteListing(supabase, id);
    revalidatePath('/admin/listings');
    return { success: true, message: 'Listing deleted.' };
  } catch (error) {
    return { success: false, message: `Database Error: ${error.message}` };
  }
}
