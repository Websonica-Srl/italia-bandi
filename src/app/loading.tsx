export default function RootLoading() {
  return (
    <section className="py-16 md:py-24">
      <div className="container-zen max-w-4xl animate-pulse">
        <div className="h-4 w-1/3 bg-secondary rounded mb-6" />
        <div className="h-10 md:h-12 w-2/3 bg-secondary rounded mb-4" />
        <div className="h-4 w-1/2 bg-secondary rounded mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 bg-secondary rounded-3xl" />
          ))}
        </div>
        <span className="sr-only">Caricamento in corso...</span>
      </div>
    </section>
  );
}
