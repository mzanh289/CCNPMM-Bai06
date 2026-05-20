const CategoryStrip = ({ categories = [] }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => (
        <div
          key={category.id}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Category</p>
          <h4 className="mt-3 text-lg font-semibold text-slate-900">{category.name}</h4>
          <p className="mt-2 text-sm text-slate-500">{category.description || 'Discover curated picks.'}</p>
        </div>
      ))}
    </div>
  );
};

export default CategoryStrip;
