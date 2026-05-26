import { Link } from 'react-router-dom';

const AdminHomePage = () => {
  return (
    <div className="section-shell py-10 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Admin dashboard</h1>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">Quick links</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/admin/profile"
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
          >
            Order management
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
