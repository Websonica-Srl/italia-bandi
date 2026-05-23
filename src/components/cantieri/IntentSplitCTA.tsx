import { ArrowRight, HardHat, DraftingCompass, BellRing, Users } from 'lucide-react';

const UTM_BASE = '?utm_source=italiacantieri&utm_medium=home_cta_split&utm_campaign=intent_split';

const HUB_REGISTER_IMPRESA = `https://www.italiaprogettisti.com/register${UTM_BASE}&intent=impresa`;
const HUB_REGISTER_STUDIO = `https://www.italiaprogettisti.com/register${UTM_BASE}&intent=studio`;

/**
 * R5 HIGH: due CTA differenziate per persona.
 * Sostituisce il bottone generico in fondo homepage.
 */
export default function IntentSplitCTA() {
  return (
    <section
      aria-labelledby="intent-split-heading"
      className="py-16 md:py-24 bg-foreground text-background relative overflow-hidden"
    >
      {/* decorativo */}
      <div aria-hidden="true" className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-background/5 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-background/5 blur-3xl" />

      <div className="container-zen relative">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-background/10 border border-background/20 px-4 py-1.5 text-xs font-medium mb-6">
            <Users className="h-3.5 w-3.5" strokeWidth={2} /> Database in espansione · Network ItaliaProgettisti
          </span>
          <h2
            id="intent-split-heading"
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3"
          >
            Trasforma i cantieri pubblici in clienti reali.
          </h2>
          <p className="text-base md:text-lg opacity-80 leading-relaxed">
            Scegli il percorso che fa per te. Registrazione gratuita, senza carta di credito.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {/* CARD IMPRESA */}
          <article className="group relative rounded-3xl bg-background text-foreground p-7 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background mb-5">
              <HardHat className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 tracking-tight">Sei un&apos;impresa edile?</h3>
            <p className="text-sm text-secondary-text leading-relaxed mb-5">
              Intercetta subappalti e nuovi lavori nella tua zona. Ricevi alert quando viene aperto un cantiere entro
              20 km dalla tua sede e contatta il titolare in anteprima.
            </p>
            <ul className="space-y-2 mb-7 text-sm text-foreground/85">
              <li className="flex items-start gap-2">
                <BellRing className="h-4 w-4 mt-0.5 flex-shrink-0 text-foreground/60" strokeWidth={1.75} />
                Alert email su nuovi cantieri della tua zona
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground/40 flex-shrink-0" />
                Profilo impresa visibile ai progettisti del network ItaliaProgettisti
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground/40 flex-shrink-0" />
                Esportazione CSV dati committenti
              </li>
            </ul>
            <a
              href={HUB_REGISTER_IMPRESA}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground text-background px-6 py-3 font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Registra la tua impresa edile gratis su ItaliaProgettisti"
            >
              Registra la tua impresa
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </a>
          </article>

          {/* CARD STUDIO */}
          <article className="group relative rounded-3xl bg-background text-foreground p-7 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background mb-5">
              <DraftingCompass className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 tracking-tight">Sei uno studio di progettazione?</h3>
            <p className="text-sm text-secondary-text leading-relaxed mb-5">
              Trova nuovi committenti nella fase più calda: quando il permesso è appena stato rilasciato. Costruisci
              il tuo portfolio digitale e fatti trovare da chi sta investendo.
            </p>
            <ul className="space-y-2 mb-7 text-sm text-foreground/85">
              <li className="flex items-start gap-2">
                <BellRing className="h-4 w-4 mt-0.5 flex-shrink-0 text-foreground/60" strokeWidth={1.75} />
                Alert su cantieri in fase progettuale
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground/40 flex-shrink-0" />
                Profilo studio + portfolio pubblicabile
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground/40 flex-shrink-0" />
                Mappa cantieri attivi nella tua regione
              </li>
            </ul>
            <a
              href={HUB_REGISTER_STUDIO}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground text-background px-6 py-3 font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Registra il tuo studio di progettazione gratis su ItaliaProgettisti"
            >
              Registra il tuo studio
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </a>
          </article>
        </div>

        <p className="text-xs opacity-60 text-center mt-8 max-w-2xl mx-auto">
          Dati provenienti da fonti pubbliche italiane, trattati nel rispetto del GDPR (Art. 6.1.f legittimo interesse).
        </p>
      </div>
    </section>
  );
}
