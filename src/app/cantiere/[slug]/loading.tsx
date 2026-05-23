export default function CantiereLoading() {
  return (
    <section className="py-10 md:py-14">
      <div className="container-zen max-w-5xl animate-pulse">
        <div className="h-3 w-2/5 bg-secondary rounded mb-6" />
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-20 bg-secondary rounded-full" />
          <div className="h-6 w-24 bg-secondary rounded-full" />
        </div>
        <div className="h-9 md:h-11 w-4/5 bg-secondary rounded mb-3" />
        <div className="h-4 w-3/5 bg-secondary rounded mb-8" />
        <div className="h-32 bg-foreground/10 rounded-3xl mb-10" />
        <div className="h-64 bg-secondary rounded-3xl mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="h-56 bg-secondary rounded-3xl" />
          <div className="h-56 bg-secondary rounded-3xl" />
        </div>
        <div className="h-72 bg-secondary rounded-3xl mb-10" />
        <span className="sr-only">Caricamento scheda cantiere...</span>
      </div>
    </section>
  );
}
