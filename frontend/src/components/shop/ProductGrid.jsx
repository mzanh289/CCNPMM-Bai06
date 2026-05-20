import ProductCard from './ProductCard';

const ProductGrid = ({ items = [], isLoading, error, emptyMessage }) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">{error}</div>;
  }

  if (!items.length) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">{emptyMessage}</div>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ProductCard key={item.id || item._id} product={item} />
      ))}
    </div>
  );
};

export default ProductGrid;
