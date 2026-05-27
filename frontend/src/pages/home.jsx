import { useEffect, useMemo, useRef, useState } from 'react';
import ShopHeader from '../components/shop/ShopHeader';
import HeroBanner from '../components/shop/HeroBanner';
import SectionHeader from '../components/shop/SectionHeader';
import ProductGrid from '../components/shop/ProductGrid';
import ProductCard from '../components/shop/ProductCard';
import FilterPanel from '../components/shop/FilterPanel';
import CategoryStrip from '../components/shop/CategoryStrip';
import ShopFooter from '../components/shop/ShopFooter';
import {
  fetchCategories,
  fetchLatestProducts,
  fetchProducts,
  fetchPromotionProducts,
  fetchTopSellingProducts,
  fetchTopViewedProducts
} from '../util/catalog.api';

const debounce = (fn, delay = 400) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const HomePage = () => {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [latest, setLatest] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [topViewed, setTopViewed] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [catalog, setCatalog] = useState({ items: [], page: 1, totalPages: 1, total: 0, hasMore: true });
  const [loading, setLoading] = useState({ latest: true, topSelling: true, topViewed: true, promo: true, catalog: true, categories: true });
  const [error, setError] = useState({ latest: '', topSelling: '', topViewed: '', promo: '', catalog: '', categories: '' });

  const bestScrollRef = useRef(null);
  const viewedScrollRef = useRef(null);
  const catalogSentinelRef = useRef(null);

  const [filters, setFilters] = useState({
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    discounted: false,
    bestSelling: false,
    newest: false,
    inStock: false,
    sort: 'newest'
  });

  const loadLanding = async () => {
    try {
      const [categoryRes, latestRes, topSellingRes, topViewedRes, promoRes] = await Promise.all([
        fetchCategories(),
        fetchLatestProducts(6),
        fetchTopSellingProducts(10),
        fetchTopViewedProducts(10),
        fetchPromotionProducts(6)
      ]);
      console.log('topSelling', topSellingRes);
      console.log('promotions', promoRes);
      setCategories(categoryRes?.categories ?? []);
      setLatest(latestRes?.items ?? []);
      setTopSelling(
        topSellingRes?.items ||
        topSellingRes?.products ||
        []
      );

      setTopViewed(
        topViewedRes?.items ||
        topViewedRes?.products ||
        []
      );

      setPromotions(
        promoRes?.items ||
        promoRes?.products ||
        []
      );
      setError((prev) => ({ ...prev, latest: '', topSelling: '', topViewed: '', promo: '', categories: '' }));
    } catch {
      setError((prev) => ({
        ...prev,
        latest: 'Unable to load latest products.',
        topSelling: 'Unable to load top sellers.',
        topViewed: 'Unable to load most viewed products.',
        promo: 'Unable to load promotions.',
        categories: 'Unable to load categories.'
      }));
    } finally {
      setLoading((prev) => ({ ...prev, latest: false, topSelling: false, topViewed: false, promo: false, categories: false }));
    }
  };

  const loadCatalog = async ({ nextFilters = filters, page = 1, append = false, keyword = search } = {}) => {
    if (!append) {
      setCatalog((prev) => ({ ...prev, items: [], page: 1, hasMore: true }));
    }
    setLoading((prev) => ({ ...prev, catalog: true }));
    try {
      const res = await fetchProducts({
        search: keyword,
        categoryId: nextFilters.categoryId,
        minPrice: nextFilters.minPrice,
        maxPrice: nextFilters.maxPrice,
        discounted: nextFilters.discounted,
        bestSelling: nextFilters.bestSelling,
        newest: nextFilters.newest,
        inStock: nextFilters.inStock,
        sort: nextFilters.sort,
        page,
        limit: 9
      });
      const products = Array.isArray(res?.products) ? res.products : (res?.items ?? []);
      const total = res?.total ?? res?.pagination?.total ?? products.length;
      const totalPages = res?.totalPages ?? res?.pagination?.totalPages ?? 1;
      const hasMore = res?.hasMore ?? page < totalPages;

      setCatalog((prev) => ({
        items: append ? [...prev.items, ...products] : products,
        page,
        total,
        totalPages,
        hasMore
      }));
      setError((prev) => ({ ...prev, catalog: '' }));
    } catch {
      setError((prev) => ({ ...prev, catalog: 'Unable to load catalog.' }));
    } finally {
      setLoading((prev) => ({ ...prev, catalog: false }));
    }
  };

  const handleHorizontalScroll = (ref, direction) => {
    if (!ref?.current) {
      return;
    }
    ref.current.scrollBy({ left: direction * 320, behavior: 'smooth' });
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        const nextFilters = { ...filters };
        loadCatalog({ nextFilters, page: 1, append: false, keyword: value });
        setFilters(nextFilters);
      }, 450),
    [filters]
  );

  const handleSearchChange = (value) => {
    setSearch(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    loadLanding();
    loadCatalog({ nextFilters: filters, page: 1, append: false, keyword: search });
  }, []);

  useEffect(() => {
    const node = catalogSentinelRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading.catalog && catalog.hasMore) {
          loadCatalog({ nextFilters: filters, page: catalog.page + 1, append: true, keyword: search });
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [catalog.page, catalog.hasMore, loading.catalog, filters, search]);

  const handleFilterChange = (patch) => {
    const nextFilters = { ...filters, ...patch };
    setFilters(nextFilters);
    loadCatalog({ nextFilters, page: 1, append: false, keyword: search });
  };

  const handleReset = () => {
    const nextFilters = {
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      discounted: false,
      bestSelling: false,
      newest: false,
      inStock: false,
      sort: 'newest'
    };
    setFilters(nextFilters);
    loadCatalog({ nextFilters, page: 1, append: false, keyword: search });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader
        searchValue={search}
        onSearchChange={handleSearchChange}
      />

      <main className="flex flex-col gap-16 py-10">
        <HeroBanner />

        <section id="latest" className="section-shell space-y-8">
          <SectionHeader
            eyebrow="Latest"
            title="New arrivals"
            description="Fresh drops curated from your most-loved categories."
          />
          <ProductGrid
            items={latest}
            isLoading={loading.latest}
            error={error.latest}
            emptyMessage="No products available right now."
          />
        </section>

        <section id="best-sellers" className="section-shell space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeader
              eyebrow="Best sellers"
              title="Shop the crowd favorites"
              description="Top-moving products based on real sales volume."
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                onClick={() => handleHorizontalScroll(bestScrollRef, -1)}
              >
                Prev
              </button>
              <button
                type="button"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                onClick={() => handleHorizontalScroll(bestScrollRef, 1)}
              >
                Next
              </button>
            </div>
          </div>
          {loading.topSelling ? (
            <div className="flex gap-6 overflow-hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-72 min-w-[260px] rounded-3xl border border-slate-200 bg-white animate-pulse" />
              ))}
            </div>
          ) : error.topSelling ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">{error.topSelling}</div>
          ) : topSelling.length ? (
            <div
              ref={bestScrollRef}
              className="flex gap-6 overflow-x-auto pb-3 scroll-smooth"
            >
              {topSelling.map((product) => (
                <div key={product.id || product._id} className="min-w-[260px] max-w-[260px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No best-selling products yet.</div>
          )}
        </section>

        <section id="most-viewed" className="section-shell space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeader
              eyebrow="Most viewed"
              title="Trending right now"
              description="Products getting the most attention from shoppers."
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                onClick={() => handleHorizontalScroll(viewedScrollRef, -1)}
              >
                Prev
              </button>
              <button
                type="button"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                onClick={() => handleHorizontalScroll(viewedScrollRef, 1)}
              >
                Next
              </button>
            </div>
          </div>
          {loading.topViewed ? (
            <div className="flex gap-6 overflow-hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-72 min-w-[260px] rounded-3xl border border-slate-200 bg-white animate-pulse" />
              ))}
            </div>
          ) : error.topViewed ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">{error.topViewed}</div>
          ) : topViewed.length ? (
            <div
              ref={viewedScrollRef}
              className="flex gap-6 overflow-x-auto pb-3 scroll-smooth"
            >
              {topViewed.map((product) => (
                <div key={product.id || product._id} className="min-w-[260px] max-w-[260px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No viewed products yet.</div>
          )}
        </section>

        <section id="promotions" className="section-shell space-y-8">
          <SectionHeader
            eyebrow="Promotions"
            title="Limited-time savings"
            description="Active discounts pulled directly from the database."
          />
          <ProductGrid
            items={promotions}
            isLoading={loading.promo}
            error={error.promo}
            emptyMessage="No active promotions right now."
          />
        </section>

        <section id="categories" className="section-shell space-y-8">
          <SectionHeader
            eyebrow="Categories"
            title="Browse by category"
            description="Explore product groups curated by our team."
          />
          {loading.categories ? (
            <div className="h-32 animate-pulse rounded-3xl border border-slate-200 bg-white" />
          ) : (
            <CategoryStrip categories={categories} />
          )}
          {error.categories && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">{error.categories}</div>
          )}
        </section>

        <section className="section-shell space-y-8">
          <SectionHeader
            eyebrow="Catalog"
            title="Search and filter"
            description="Find the right product using multi-condition filters and sorting."
          />
          <div className="grid items-start gap-8 lg:grid-cols-[280px_1fr]">
            <div className="self-start lg:sticky lg:top-24">
              <FilterPanel
                categories={categories}
                filters={filters}
                searchValue={search}
                onSearchChange={handleSearchChange}
                onChange={handleFilterChange}
                onReset={handleReset}
              />
            </div>
            <div className="space-y-6">
              <ProductGrid
                items={catalog.items}
                isLoading={loading.catalog && catalog.items.length === 0}
                error={error.catalog}
                emptyMessage="No products match the current filters."
              />
              {catalog.hasMore && !loading.catalog && (
                <div className="text-center text-sm text-slate-500">Scroll to load more products.</div>
              )}
              {loading.catalog && catalog.items.length > 0 && (
                <div className="text-center text-sm text-slate-500">Loading more products...</div>
              )}
              <div ref={catalogSentinelRef} className="h-1" />
            </div>
          </div>
        </section>
      </main>

      <ShopFooter />
    </div>
  );
};

export default HomePage;