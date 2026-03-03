import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 1. HANDLES THE "PRE-FLIGHT" CHECK (Chrome asking permission)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*', // The "Open Door" policy
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// 2. HANDLES THE ACTUAL DATA
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('haven_jobs')
      .insert(body.jobs);

    if (error) throw error;

    return NextResponse.json({ success: true }, {
      headers: {
        'Access-Control-Allow-Origin': '*', // Keep door open for response
      }
    });
  } catch (err: any) {
    console.error("Vault Error:", err.message);
    return NextResponse.json({ error: err.message }, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' } 
    });
  }
}
