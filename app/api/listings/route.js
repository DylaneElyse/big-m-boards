import { NextResponse } from 'next/server';
import { getListingsPaginated } from '@/lib/supabase/api';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page')) || 1;
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const availabilityFilter = searchParams.get('availabilityFilter') || 'all';
    const limit = parseInt(searchParams.get('limit')) || 12;

    const result = await getListingsPaginated({
      page,
      limit,
      sortBy,
      sortOrder,
      availabilityFilter
    });

    return NextResponse.json({
      success: true,
      listings: result.listings,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('API Error fetching listings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch listings',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
