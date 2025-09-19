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
  
  // --- File Upload Logic with Service Role Client ---
  const images = formData.getAll('images').filter(file => file.size > 0);
  const imageUrls = [];

  if (images.length > 0) {
    // Create service role client for storage operations to bypass RLS
    const { createClient: createServiceClient } = await import('@supabase/supabase-js');
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY
    );

    for (const image of images) {
      // Validate file type
      if (!image.type.startsWith('image/')) {
        return { message: `Invalid file type: ${image.name}. Please upload only image files.` };
      }

      // Convert File to ArrayBuffer for proper upload
      const arrayBuffer = await image.arrayBuffer();
      const fileName = `${Date.now()}-${image.name}`;
      
      const { data, error } = await serviceSupabase.storage
        .from('listing-images') 
        .upload(fileName, arrayBuffer, {
          contentType: image.type,
          upsert: false
        });

      if (error) {
        console.error('Storage Error:', error);
        return { message: `Failed to upload image: ${error.message}` };
      }
      
      const { data: { publicUrl } } = serviceSupabase.storage
        .from('listing-images')
        .getPublicUrl(data.path);
        
      imageUrls.push(publicUrl);
    }
  }

  // --- Prepare and Validate Data ---
  const title = formData.get('title');
  const priceValue = formData.get('price');
  const rawData = {
    title: title,
    slug: slugify(title), // This part was already correct
    description: formData.get('description'),
    price: priceValue ? parseFloat(priceValue) : null,
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

  // --- Get current images from form data ---
  const currentImagesJson = formData.get('current_images');
  let currentImages = [];
  if (currentImagesJson) {
    try {
      currentImages = JSON.parse(currentImagesJson);
    } catch (e) {
      console.error('Failed to parse current images:', e);
    }
  }

  // --- File Upload Logic for new images ---
  const newImages = formData.getAll('images').filter(file => file.size > 0);
  let newImageUrls = [];

  if (newImages.length > 0) {
    // Create service role client for storage operations to bypass RLS
    const { createClient: createServiceClient } = await import('@supabase/supabase-js');
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY
    );

    for (const image of newImages) {
      // Validate file type
      if (!image.type.startsWith('image/')) {
        return { message: `Invalid file type: ${image.name}. Please upload only image files.` };
      }

      // Convert File to ArrayBuffer for proper upload
      const arrayBuffer = await image.arrayBuffer();
      const fileName = `${Date.now()}-${image.name}`;
      
      const { data, error } = await serviceSupabase.storage
        .from('listing-images') 
        .upload(fileName, arrayBuffer, {
          contentType: image.type,
          upsert: false
        });

      if (error) {
        console.error('Storage Error:', error);
        return { message: `Failed to upload image: ${error.message}` };
      }
      
      const { data: { publicUrl } } = serviceSupabase.storage
        .from('listing-images')
        .getPublicUrl(data.path);
        
      newImageUrls.push(publicUrl);
    }
  }

  // --- Combine current images with new images ---
  const finalImageUrls = [...currentImages, ...newImageUrls];

  // --- Prepare and Validate Data ---
  const title = formData.get('title');
  const priceValue = formData.get('price');
  const rawData = {
    title: title,
    slug: slugify(title),
    description: formData.get('description'),
    price: priceValue ? parseFloat(priceValue) : null,
    is_available: formData.get('is_available') === 'on',
    image_urls: finalImageUrls.length > 0 ? finalImageUrls : null,
  };

  // We use .partial() because not all schema fields are being submitted here (e.g., user_id)
  const validatedFields = listingSchema.partial().safeParse(rawData);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  
  try {
    const updatedListing = await updateListing(supabase, id, validatedFields.data);
    
    // CHANGE: Updated revalidation and return a success message with new slug
    revalidatePath('/admin/listings', 'layout'); // This revalidates the list and all slug-based detail pages.
    revalidatePath('/listings', 'layout'); // Also revalidate public pages if they exist

    return { 
      success: true, 
      message: 'Listing updated successfully!',
      newSlug: updatedListing.slug // Return the new slug for redirect
    };
  } catch (error) {
    // CHANGE: Add specific error handling for duplicate slugs
    if (error.code === '23505') { 
        return { message: 'Database Error: Another listing with this title already exists. Please choose a different title.' };
    }
    return { message: `Database Error: ${error.message}` };
  }
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
