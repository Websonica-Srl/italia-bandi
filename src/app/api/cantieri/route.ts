import { NextResponse } from 'next/server';
import { getCantieri } from '@/lib/supabase/queries/cantieri';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const regione = searchParams.get('regione') || undefined;
  const provincia = searchParams.get('provincia') || undefined;
  const comune = searchParams.get('comune') || undefined;
  const categoria = searchParams.get('categoria') || undefined;
  const tipo_titolo = searchParams.get('tipo_titolo') || undefined;
  const q = searchParams.get('q') || undefined;
  const limit = Math.min(Number(searchParams.get('limit')) || 12, 100);
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);

  const { data, total } = await getCantieri({ regione, provincia, comune, categoria, tipo_titolo, q, limit, offset });
  return NextResponse.json({
    total,
    limit,
    offset,
    has_more: offset + data.length < total,
    data,
  });
}
