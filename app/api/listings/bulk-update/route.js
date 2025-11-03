import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { bulkUpdateListings } from '@/lib/supabase/api';

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

    const { listingIds, updateData } = await request.json();

    if (!listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No listing IDs provided' },
        { status: 400 }
      );
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No update data provided' },
        { status: 400 }
      );
    }

    // Validate update data fields
    const allowedFields = ['is_available', 'price'];
    const updateFields = Object.keys(updateData);
    const invalidFields = updateFields.filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Invalid fields: ${invalidFields.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await bulkUpdateListings(supabase, listingIds, updateData);

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.updatedCount} listing(s)`,
      updatedCount: result.updatedCount
    });

  } catch (error) {
    console.error('API Error bulk updating listings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update listings',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
