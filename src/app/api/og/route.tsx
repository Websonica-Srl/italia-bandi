/**
 * Endpoint Edge Runtime per generare og:image dinamiche.
 *
 * Stile HUB-aligned: nero su cream, tipografia Inter editorial,
 * KPI grande tabular-nums, layout asimmetrico con accent construction.
 *
 * Parametri query supportati:
 *   - title    (required) — titolo principale (max 110 char)
 *   - subtitle (optional) — sottotitolo / contesto (max 140 char)
 *   - kind     (optional) — 'regione' | 'comune' | 'cantiere' | 'bando' | 'stats' | 'glossario' | 'generic'
 *   - count    (optional) — numero grande in evidenza (es. "8.880", "€450K")
 *   - label    (optional) — label sotto al count (es. "cantieri tracciati")
 *
 * Esempi:
 *   /api/og?title=Cantieri%20edilizi%20in%20Piemonte&kind=regione&count=2.341&label=cantieri%20tracciati
 *   /api/og?title=Permesso%20di%20Costruire%20Bologna&subtitle=Importo%20%E2%82%AC450K&kind=cantiere
 *   /api/og?title=Statistiche%20cantieri%20Italia&kind=stats&count=8.880&label=cantieri%20pubblici
 */
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Colori HUB-aligned (cream + nero + construction yellow)
const COLORS = {
  background: '#FAF7F2', // cream
  foreground: '#111111', // nero quasi puro
  muted: '#6B6B6B',
  border: '#E5E0D8',
  construction: '#F5C518', // giallo construction
  accent: '#0A0A0A',
};

const KIND_LABELS: Record<string, string> = {
  regione: 'Cantieri per regione',
  comune: 'Cantieri per Comune',
  cantiere: 'Scheda cantiere',
  bando: 'Bando pubblico',
  stats: 'Statistiche nazionali',
  glossario: 'Glossario edilizia',
  generic: 'Database pubblico cantieri',
  pa: 'Per Pubbliche Amministrazioni',
  api: 'API & sviluppatori',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const rawTitle = (searchParams.get('title') || 'Italia Cantieri').slice(0, 110);
    const rawSubtitle = (searchParams.get('subtitle') || '').slice(0, 140);
    const kind = (searchParams.get('kind') || 'generic').toLowerCase();
    const count = (searchParams.get('count') || '').slice(0, 12);
    const label = (searchParams.get('label') || '').slice(0, 40);

    const eyebrow = KIND_LABELS[kind] || KIND_LABELS.generic;
    const hasCount = count && count.length > 0;

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: COLORS.background,
            position: 'relative',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Bordo decorativo top */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '8px',
              backgroundColor: COLORS.foreground,
              display: 'flex',
            }}
          />

          {/* Accent corner construction */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: 0,
              width: '180px',
              height: '8px',
              backgroundColor: COLORS.construction,
              display: 'flex',
            }}
          />

          {/* Container principale */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '64px 72px',
              justifyContent: 'space-between',
            }}
          >
            {/* TOP: Brand mark + eyebrow */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Logo mark */}
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    backgroundColor: COLORS.foreground,
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: COLORS.background,
                    fontSize: '28px',
                    fontWeight: 900,
                  }}
                >
                  IC
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: '24px',
                      fontWeight: 900,
                      letterSpacing: '-0.03em',
                      color: COLORS.foreground,
                      lineHeight: 1,
                    }}
                  >
                    Italia<span style={{ opacity: 0.55 }}>Cantieri</span>
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: COLORS.muted,
                      marginTop: '4px',
                    }}
                  >
                    italiacantieri.it
                  </span>
                </div>
              </div>

              {/* Eyebrow kind */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 18px',
                  border: `1.5px solid ${COLORS.foreground}`,
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: COLORS.foreground,
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: COLORS.construction,
                    display: 'flex',
                  }}
                />
                {eyebrow}
              </div>
            </div>

            {/* CENTRO: Title + Subtitle / Count */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {hasCount && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '24px',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '128px',
                      fontWeight: 900,
                      letterSpacing: '-0.055em',
                      lineHeight: 0.88,
                      color: COLORS.foreground,
                      fontVariantNumeric: 'tabular-nums',
                      display: 'flex',
                    }}
                  >
                    {count}
                  </span>
                  {label && (
                    <span
                      style={{
                        fontSize: '20px',
                        fontWeight: 600,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: COLORS.muted,
                        display: 'flex',
                        maxWidth: '300px',
                      }}
                    >
                      {label}
                    </span>
                  )}
                </div>
              )}

              <h1
                style={{
                  fontSize: hasCount ? '52px' : '72px',
                  fontWeight: 900,
                  letterSpacing: '-0.045em',
                  lineHeight: 1.02,
                  color: COLORS.foreground,
                  margin: 0,
                  display: 'flex',
                  maxWidth: '1050px',
                }}
              >
                {rawTitle}
              </h1>

              {rawSubtitle && (
                <p
                  style={{
                    fontSize: '24px',
                    fontWeight: 400,
                    lineHeight: 1.4,
                    color: COLORS.muted,
                    margin: 0,
                    display: 'flex',
                    maxWidth: '900px',
                  }}
                >
                  {rawSubtitle}
                </p>
              )}
            </div>

            {/* BOTTOM: trust strip + URL */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: `1.5px solid ${COLORS.border}`,
                paddingTop: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '32px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: COLORS.muted,
                  letterSpacing: '0.04em',
                }}
              >
                <span style={{ display: 'flex' }}>Fonti pubbliche italiane</span>
                <span style={{ display: 'flex' }}>·</span>
                <span style={{ display: 'flex' }}>Aggiornato ogni giorno</span>
                <span style={{ display: 'flex' }}>·</span>
                <span style={{ display: 'flex' }}>GDPR compliant</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: COLORS.foreground,
                }}
              >
                <span
                  style={{
                    width: '24px',
                    height: '2px',
                    backgroundColor: COLORS.construction,
                    display: 'flex',
                  }}
                />
                italiacantieri.it
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'OG image generation failed', detail: (e as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
