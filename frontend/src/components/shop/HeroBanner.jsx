const HeroBanner = () => {
  return (
    <section className="section-shell">
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-8 py-12 text-white shadow-2xl md:px-12 lg:px-16">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="inline-flex w-fit rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
              Spring 2026 drop
            </p>
            <h2 className="font-display text-3xl leading-tight md:text-5xl">
              Curated essentials for the modern shopper.
            </h2>
            <p className="text-sm text-slate-200 md:text-base">
              Discover best sellers, new arrivals, and exclusive promotions tailored for you.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900">Shop now</button>
              <button className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white">
                Explore collections
              </button>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl bg-white/10 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Flash sales</p>
              <p className="mt-3 text-2xl font-semibold">Up to 40% off</p>
              <p className="mt-2 text-sm text-slate-300">Limited time on featured items.</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Member perks</p>
              <p className="mt-3 text-2xl font-semibold">Free express delivery</p>
              <p className="mt-2 text-sm text-slate-300">On orders over $120.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
