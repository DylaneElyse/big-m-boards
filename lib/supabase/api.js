import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// --- SCHEMA DEFINITION ---
export const listingSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters long." }),
  slug: z.string(),
  description: z.string().optional(),
  price: z.number().positive({ message: "Price must be a positive number." }).optional().nullable(),
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
    .eq('id', id);

  if (error) {
    console.error(`Supabase error fetching listing ${id}:`, error.message);
    throw new Error('Could not fetch the specified listing.');
  }

  if (!data || data.length === 0) {
    console.log(`No listing found with id ${id}`);
    return null;
  }

  const listing = data[0];

  if (listing && listing.image_urls) {
    try {
      const jsonString = JSON.stringify(listing.image_urls);
      listing.image_urls = JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to convert image_urls to array:', e);
      if (listing.image_urls && typeof listing.image_urls === 'object') {
        const urls = [];
        for (let i = 0; i < (listing.image_urls.length || 10); i++) {
          if (listing.image_urls[i]) {
            urls.push(listing.image_urls[i]);
          }
        }
        listing.image_urls = urls;
      } else {
        listing.image_urls = [];
      }
    }
  }

  return listing;
}

export async function getListingBySlug(supabase, slug) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('slug', slug); 

  if (error) {
    console.error(`Supabase error fetching listing with slug "${slug}":`, error.message);
    return null; 
  }

  if (!data || data.length === 0) {
    console.error(`No listing found with slug "${slug}"`);
    return null;
  }

  const listing = data[0];

  if (listing && listing.image_urls) {
    try {
      const jsonString = JSON.stringify(listing.image_urls);
      listing.image_urls = JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to convert image_urls to array:', e);
      if (listing.image_urls && typeof listing.image_urls === 'object') {
        const urls = [];
        for (let i = 0; i < (listing.image_urls.length || 10); i++) {
          if (listing.image_urls[i]) {
            urls.push(listing.image_urls[i]);
          }
        }
        listing.image_urls = urls;
      } else {
        listing.image_urls = [];
      }
    }
  }

  return listing;
}


// --- WRITE FUNCTIONS (CUD) ---

export async function createListing(supabase, listingData) {
  const { data, error } = await supabase
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

  if (error) {
    console.error(`Supabase error updating listing ${id}:`, error.message);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error('Listing not found or you do not have permission to edit it.');
  }

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

// --- ANALYTICS FUNCTIONS ---

export async function getDashboardStats() {
  const supabase = await createClient();
  
  try {
    const { count: totalListings, error: totalError } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    const { count: availableListings, error: availableError } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('is_available', true);

    if (availableError) throw availableError;

    const { count: listingsWithPrices, error: priceError } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .not('price', 'is', null);

    if (priceError) throw priceError;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: recentListings, error: recentError } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    if (recentError) throw recentError;

    const { data: priceData, error: avgPriceError } = await supabase
      .from('listings')
      .select('price')
      .not('price', 'is', null);

    if (avgPriceError) throw avgPriceError;

    const averagePrice = priceData && priceData.length > 0 
      ? priceData.reduce((sum, item) => sum + (item.price || 0), 0) / priceData.length 
      : 0;

    return {
      totalListings: totalListings || 0,
      availableListings: availableListings || 0,
      unavailableListings: (totalListings || 0) - (availableListings || 0),
      listingsWithPrices: listingsWithPrices || 0,
      recentListings: recentListings || 0,
      averagePrice: averagePrice
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalListings: 0,
      availableListings: 0,
      unavailableListings: 0,
      listingsWithPrices: 0,
      recentListings: 0,
      averagePrice: 0
    };
  }
}

export async function getRecentListings(limit = 5) {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('id, title, slug, created_at, is_available, price')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recent listings:', error);
    return [];
  }
}
