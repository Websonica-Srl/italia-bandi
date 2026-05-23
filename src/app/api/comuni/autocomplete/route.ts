import { NextResponse } from 'next/server';
import { searchComuni } from '@/lib/supabase/queries/cantieri';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const limit = Math.min(Number(searchParams.get('limit')) || 10, 25);

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchComuni(q, limit);
  return NextResponse.json({ results });
}
