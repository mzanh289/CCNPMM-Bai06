const ShopFooter = () => {
  return (
    <footer className="border-t border-slate-200 bg-white/80 py-10">
      <div className="section-shell">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">QuickCart</p>
            <h3 className="mt-3 font-display text-2xl text-slate-900">Commerce Studio</h3>
            <p className="mt-4 text-sm text-slate-500">
              A curated marketplace with real-time product data, handpicked for modern shoppers.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Explore</p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#latest">Latest arrivals</a></li>
              <li><a href="#best-sellers">Best sellers</a></li>
              <li><a href="#promotions">Promotions</a></li>
              <li><a href="#categories">Categories</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Support</p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>help@quickcart.io</li>
              <li>+1 222 112 4567</li>
              <li>Mon - Sat · 08:00 - 22:00</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>© 2026 QuickCart Commerce Studio</span>
          <span>Built with care for modern shopping experiences.</span>
        </div>
      </div>
    </footer>
  );
};

export default ShopFooter;
