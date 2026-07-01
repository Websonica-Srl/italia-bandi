import { describe, it, expect } from 'vitest';
import { decodeEntities, bandoTitolo } from '../utils';

describe('decodeEntities', () => {
  it('decodifica entita numeriche decimali accentate', () => {
    expect(decodeEntities('attivit&#224;')).toBe('attività');
  });

  it('decodifica le virgolette tipografiche', () => {
    expect(decodeEntities('&#8220;x&#8221;')).toBe('“x”');
  });

  it("decodifica l'apostrofo numerico", () => {
    expect(decodeEntities('Sant&#039;Arsenio')).toBe("Sant'Arsenio");
  });

  it('decodifica entita esadecimali', () => {
    expect(decodeEntities('caff&#xE8;')).toBe('caffè');
  });

  it('decodifica le entita nominali basilari', () => {
    expect(decodeEntities('Rossi &amp; Bianchi')).toBe('Rossi & Bianchi');
    expect(decodeEntities('&quot;ok&quot;')).toBe('"ok"');
  });

  it('ritorna stringa vuota per input nullo/undefined', () => {
    expect(decodeEntities(null)).toBe('');
    expect(decodeEntities(undefined)).toBe('');
    expect(decodeEntities('')).toBe('');
  });
});

describe('bandoTitolo', () => {
  it("usa l'oggetto quando abbastanza lungo, decodificando le entita", () => {
    expect(
      bandoTitolo({ oggetto: 'Lavori di rifacimento della facciata attivit&#224;' }),
    ).toBe('Lavori di rifacimento della facciata attività');
  });

  it('costruisce il fallback categoria + ente quando oggetto degradato', () => {
    expect(
      bandoTitolo(
        { oggetto: 'I', stazione_appaltante: 'Comune di Roma' },
        'Lavori di costruzione',
      ),
    ).toBe('Lavori di costruzione — Comune di Roma');
  });

  it('usa il CIG come ultimo fallback', () => {
    expect(bandoTitolo({ oggetto: '', cig: 'ABC123' })).toBe('Bando di gara ABC123');
  });

  it('usa un titolo generico se manca tutto', () => {
    expect(bandoTitolo({})).toBe('Bando di gara pubblico');
  });
});
