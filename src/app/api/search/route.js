import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  try {
     const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album`);

    if (!res.ok) {
      throw new Error('Failed to fetch from iTunes');
    }

    const data = await res.json();
    const results = data.results || [];

    return NextResponse.json(results);

  } catch (error) {
    console.error('iTunes API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } 
}