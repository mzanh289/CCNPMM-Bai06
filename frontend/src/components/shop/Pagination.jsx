const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {pages.map((current) => (
        <button
          key={current}
          className={`h-10 w-10 rounded-full text-sm font-semibold ${
            current === page
              ? 'bg-slate-900 text-white'
              : 'border border-slate-200 text-slate-600 hover:border-slate-400'
          }`}
          onClick={() => onPageChange(current)}
        >
          {current}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
