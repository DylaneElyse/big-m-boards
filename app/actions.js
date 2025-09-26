'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createServiceClient } from '@/utils/supabase/server';
import slugify from '@/utils/createSlug'; 
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
  
  const images = formData.getAll('images').filter(file => file.size > 0);
  const imageUrls = [];

  if (images.length > 0) {
    const serviceSupabase = await createServiceClient();
    
    for (const image of images) {
      if (!image.type.startsWith('image/')) {
        return { message: `Invalid file type: ${image.name}. Please upload only image files.` };
      }

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

  const title = formData.get('title');
  const priceValue = formData.get('price');
  const rawData = {
    title: title,
    slug: slugify(title),
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

  try {
    await createListing(supabase, validatedFields.data); 
  } catch (error) {
    console.error("Full error object:", error);
    if (error.code === '23505') { 
        return { message: 'Database Error: A listing with this title already exists. Please choose a different title.' };
    }
    return { message: `Database Error: ${error.message}` };
  }

  revalidatePath('/admin/listings', 'layout'); 
  return { success: true, message: 'Listing created successfully!' };
}


export async function updateListingAction(id, prevState, formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'Authentication Error: You must be logged in to update a listing.' };
  }

  const currentImagesJson = formData.get('current_images');
  let currentImages = [];
  if (currentImagesJson) {
    try {
      currentImages = JSON.parse(currentImagesJson);
    } catch (e) {
      console.error('Failed to parse current images:', e);
    }
  }

  const newImages = formData.getAll('images').filter(file => file.size > 0);
  let newImageUrls = [];

  if (newImages.length > 0) {
    const serviceSupabase = await createServiceClient();
    
    for (const image of newImages) {
      if (!image.type.startsWith('image/')) {
        return { message: `Invalid file type: ${image.name}. Please upload only image files.` };
      }

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

  const finalImageUrls = [...currentImages, ...newImageUrls];

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

  const validatedFields = listingSchema.partial().safeParse(rawData);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  
  try {
    const updatedListing = await updateListing(supabase, id, validatedFields.data);
    
    revalidatePath('/admin/listings', 'layout'); 
    revalidatePath('/listings', 'layout');

    return { 
      success: true, 
      message: 'Listing updated successfully!',
      newSlug: updatedListing.slug 
    };
  } catch (error) {
    if (error.code === '23505') { 
        return { message: 'Database Error: Another listing with this title already exists. Please choose a different title.' };
    }
    return { message: `Database Error: ${error.message}` };
  }
}

export async function deleteListingAction(id) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Authentication Error: You must be logged in to delete a listing.' };
  }

  try {
    await deleteListing(supabase, id);
    revalidatePath('/admin/listings', 'layout');
    return { success: true, message: 'Listing deleted.' };
  } catch (error) {
    return { success: false, message: `Database Error: ${error.message}` };
  }
}
