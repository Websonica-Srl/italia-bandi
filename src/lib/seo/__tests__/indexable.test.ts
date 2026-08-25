import { describe, it, expect } from 'vitest';
import { isBandoIndexable, isListaIndexable } from '../indexable';
import type { Bando } from '@/lib/supabase/queries/bandi';

const base: Bando = {
  id: '1',
  slug: 'test-bando',
  cig: null,
  cup: null,
  numero_bando: null,
  tipo_procedura: null,
  oggetto: '',
  descrizione_completa: null,
  importo_base: null,
  importo_aggiudicazione: null,
  ribasso_percentuale: null,
  numero_offerte_ricevute: null,
  data_pubblicazione: null,
  scadenza_offerte: null,
  data_aggiudicazione: null,
  stazione_appaltante: null,
  comune: null,
  provincia: null,
  regione: null,
  categorie: null,
  cpv_principale: null,
  cpv_codes: null,
  stato: null,
  aggiudicatario_ragione_sociale_raw: null,
};

describe('isBandoIndexable (SCHEDE_PUBBLICHE_INDICIZZABILI = false)', () => {
  it('ritorna false per un bando aperto ricco (scadenza futura, oggetto e importo presenti)', () => {
    const bandoApertoRicco: Bando = {
      ...base,
      oggetto: 'Lavori di ristrutturazione di un edificio scolastico comunale con efficientamento energetico',
      importo_base: 500000,
      stazione_appaltante: 'Comune di Roma',
      scadenza_offerte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    expect(isBandoIndexable(bandoApertoRicco)).toBe(false);
  });

  it('ritorna false per un bando storico ricco (oggetto lungo + importo + ente)', () => {
    const bandoStoricoRicco: Bando = {
      ...base,
      oggetto: 'Fornitura e posa in opera di arredi scolastici per il plesso comunale di via Roma',
      importo_base: 120000,
      stazione_appaltante: 'Comune di Milano',
      scadenza_offerte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    expect(isBandoIndexable(bandoStoricoRicco)).toBe(false);
  });

  it('ritorna false per un bando thin (oggetto corto, nessun importo)', () => {
    const bandoThin: Bando = {
      ...base,
      oggetto: 'Lavori vari',
      importo_base: null,
      stazione_appaltante: null,
      scadenza_offerte: null,
    };
    expect(isBandoIndexable(bandoThin)).toBe(false);
  });
});

describe('isListaIndexable', () => {
  it('ritorna false (SCHEDE_PUBBLICHE_INDICIZZABILI = false)', () => {
    expect(isListaIndexable()).toBe(false);
  });
});
