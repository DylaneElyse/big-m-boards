import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { bulkDeleteListings } from '@/lib/supabase/api';

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { listingIds } = await request.json();

    if (!listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No listing IDs provided' },
        { status: 400 }
      );
    }

    const result = await bulkDeleteListings(supabase, listingIds);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} listing(s)`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('API Error bulk deleting listings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete listings',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
