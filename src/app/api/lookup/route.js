import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing Album ID' }, { status: 400 });
  }

  console.log('vou dar lookup ao id: ', id);

  try {
    const res = await fetch(`https://itunes.apple.com/lookup?id=${id}&entity=song`);
    
    if (!res.ok) {
      throw new Error('Failed to fetch from iTunes');
    }

    const data = await res.json();
    const results = data.results || [];

    const album = results.find((item) => item.wrapperType === 'collection');

    const tracks = results.filter((item) => 
      item.wrapperType === 'track' && item.kind === 'song'
    );

    return NextResponse.json({ album, tracks });

  } catch (error) {
    console.error('iTunes API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}