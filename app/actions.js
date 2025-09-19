'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
// Assuming your slugify function is in a utils file
import slugify from '@/utils/createSlug'; // Make sure this path is correct for your project
import {
  createListing,
  updateListing,
  deleteListing,
  listingSchema,
} from '@/lib/supabase/api';

export async function createListingAction(prevState, formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'Authentication Error: You must be logged in to create a listing.' };
  }
  
  // --- File Upload Logic (no changes) ---
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

  // --- Prepare and Validate Data ---
  const title = formData.get('title');
  const rawData = {
    title: title,
    slug: slugify(title), // This part was already correct
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

  // --- Call the API function to insert data ---
  try {
    await createListing(supabase, validatedFields.data); 
  } catch (error) {
    console.error("Full error object:", error);
    // CHANGE: Add specific error handling for duplicate slugs
    if (error.code === '23505') { // Postgres code for unique violation
        return { message: 'Database Error: A listing with this title already exists. Please choose a different title.' };
    }
    return { message: `Database Error: ${error.message}` };
  }

  // --- Revalidate and Return Success State ---
  revalidatePath('/admin/listings', 'layout'); // Revalidate list and all detail pages
  return { success: true, message: 'Listing created successfully!' };
}


export async function updateListingAction(id, prevState, formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'Authentication Error: You must be logged in to update a listing.' };
  }

  // CHANGE: Generate a new slug when the title is updated
  const title = formData.get('title');
  const rawData = {
    title: title,
    slug: slugify(title),
    description: formData.get('description'),
    is_available: formData.get('is_available') === 'on',
  };

  // We use .partial() because not all schema fields are being submitted here (e.g., user_id)
  const validatedFields = listingSchema.partial().safeParse(rawData);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  
  try {
    await updateListing(supabase, id, validatedFields.data);
  } catch (error) {
    // CHANGE: Add specific error handling for duplicate slugs
    if (error.code === '23505') { 
        return { message: 'Database Error: Another listing with this title already exists. Please choose a different title.' };
    }
    return { message: `Database Error: ${error.message}` };
  }

  // CHANGE: Updated revalidation and return a success message instead of redirecting
  revalidatePath('/admin/listings', 'layout'); // This revalidates the list and all slug-based detail pages.
  revalidatePath('/listings', 'layout'); // Also revalidate public pages if they exist

  return { success: true, message: 'Listing updated successfully!' };
}

// NO CHANGES NEEDED for deleteListingAction as it operates on the ID.
export async function deleteListingAction(id) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Authentication Error: You must be logged in to delete a listing.' };
  }

  try {
    await deleteListing(supabase, id);
    revalidatePath('/admin/listings', 'layout'); // Use 'layout' for consistency
    return { success: true, message: 'Listing deleted.' };
  } catch (error) {
    return { success: false, message: `Database Error: ${error.message}` };
  }
}