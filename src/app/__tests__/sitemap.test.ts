import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabase/queries/bandi', () => ({
  getBandiByRegione: vi.fn(async () => [
    { regione: 'Lombardia', cnt: 120 },
    { regione: 'Piemonte', cnt: 80 },
  ]),
  getBandiByProvincia: vi.fn(async () => [
    { regione: 'Lombardia', sigla: 'MI', cnt: 60 },
    { regione: 'Piemonte', sigla: 'TO', cnt: 40 },
  ]),
}));

vi.mock('@/lib/supabase/queries/intelligence', () => ({
  getLeaderboardSegments: vi.fn(async () => ({
    cpv: [{ key: '45', cnt: 5 }],
    regioni: [{ key: 'Lombardia', cnt: 5 }],
  })),
}));

import { countSitemapChunks, generateSitemaps, default as sitemap } from '../sitemap';

describe('sitemap (bandi ridotta a statiche/regioni/province/classifiche)', () => {
  it('countSitemapChunks ritorna 4 (statiche, regioni, province, classifiche)', async () => {
    expect(await countSitemapChunks()).toBe(4);
  });

  it('generateSitemaps espone esattamente 4 id', async () => {
    const chunks = await generateSitemaps();
    expect(chunks).toEqual([{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }]);
  });

  it('il chunk 0 (statiche) non contiene /bandi ne /scadenze', async () => {
    const chunk0 = await sitemap({ id: 0 });
    const urls = chunk0.map((e) => e.url);
    expect(urls.some((u) => u.endsWith('/bandi'))).toBe(false);
    expect(urls.some((u) => u.endsWith('/scadenze'))).toBe(false);
  });

  it('unione dei 4 chunk: niente /bandi/, /categoria/, /ente/; presenti statiche+regioni+province', async () => {
    const all = (
      await Promise.all([0, 1, 2, 3].map((id) => sitemap({ id })))
    ).flat();
    const urls = all.map((e) => e.url);

    for (const forbidden of ['/bandi/', '/categoria/', '/ente/']) {
      expect(urls.some((u) => u.includes(forbidden))).toBe(false);
    }

    expect(urls.some((u) => u.endsWith('/'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/regioni'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/classifiche'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/lombardia'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/piemonte'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/lombardia/milano'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/piemonte/torino'))).toBe(true);
  });
});
