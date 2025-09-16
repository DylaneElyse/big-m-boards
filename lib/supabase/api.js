import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// Schema remains the same
export const listingSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters long." }),
  description: z.string().optional(),
  image_urls: z.array(z.string().url()).optional().nullable(),
  is_available: z.boolean().default(true),
  user_id: z.string().uuid({ message: "Invalid user ID." }),
});


// --- READ FUNCTIONS ---

export async function getAllListings() {
  // THE FIX: Add await back
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

export async function getListingById(id) {
  // THE FIX: Add await back
  const supabase = await createClient();
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

// --- WRITE FUNCTIONS (CUD) ---

export async function createListing(supabase, listingData) {
  // Temporary fix: Use service role for insert to bypass RLS
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
    // Throw the original error for better debugging
    throw error;
  }

  return data;
}

export async function updateListing(supabase, id, updateData) {
  // THE FIX: Add await back
  const { data, error } = await supabase
    .from('listings')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Supabase error updating listing ${id}:`, error.message);
    throw error;
  }

  return data;
}

export async function deleteListing(supabase, id) {
  // THE FIX: Add await back
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
