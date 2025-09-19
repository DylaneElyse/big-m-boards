import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// 1. UPDATED SCHEMA: Added the 'slug' field.
export const listingSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters long." }),
  slug: z.string(),
  description: z.string().optional(),
  image_urls: z.array(z.string().url()).optional().nullable(),
  is_available: z.boolean().default(true),
  user_id: z.string().uuid({ message: "Invalid user ID." }),
});


// --- READ FUNCTIONS ---

export async function getAllListings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error fetching all listings:', error.message);
    throw new Error('Could not fetch listings.');
  }

  return data;
}

export async function getListingById(supabase, id) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Supabase error fetching listing ${id}:`, error.message);
    throw new Error('Could not fetch the specified listing.');
  }

  return data;
}

// 2. NEW FUNCTION: To get a listing by its URL-friendly slug.
export async function getListingBySlug(supabase, slug) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('slug', slug) // Query by the 'slug' column
    .single();

  if (error) {
    // It's better to return null here so the page component can trigger a notFound()
    console.error(`Supabase error fetching listing with slug "${slug}":`, error.message);
    return null; 
  }

  return data;
}


// --- WRITE FUNCTIONS (CUD) ---

// No changes needed here. The slug is generated in the server action
// BEFORE this function is called.
export async function createListing(supabase, listingData) {
  // NOTE: You are still using the service role key here.
  // This bypasses RLS but is less secure. Consider creating an INSERT policy later.
  const { createClient } = await import('@supabase/supabase-js');
  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
  );
  
  const { data, error } = await serviceSupabase
    .from('listings')
    .insert([listingData])
    .select()
    .single();

  if (error) {
    console.error('Supabase error creating listing:', error.message);
    throw error;
  }

  return data;
}

export async function updateListing(supabase, id, updateData) {
  const { data, error } = await supabase
    .from('listings')
    .update(updateData)
    .eq('id', id)
    .select()
    // REMOVED: .single() - We will check the result manually.

  if (error) {
    console.error(`Supabase error updating listing ${id}:`, error.message);
    // Pass the original error up
    throw error;
  }

  // THE FIX: Check if the update actually returned any data.
  // If `data` is null or empty, it means the listing was not found OR RLS blocked the update.
  if (!data || data.length === 0) {
    throw new Error('Listing not found or you do not have permission to edit it.');
  }

  // Return the first (and only) item from the array of updated records.
  return data[0];
}

export async function deleteListing(supabase, id) {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Supabase error deleting listing ${id}:`, error.message);
    throw error;
  }

  return { success: true };
}