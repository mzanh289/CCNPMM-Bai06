import { useState } from 'react';

const initialForm = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Vietnam',
  note: ''
};

const CheckoutForm = ({ onSubmit, loading }) => {
  const [form, setForm] = useState(initialForm);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Full name</label>
          <input
            value={form.fullName}
            onChange={(event) => handleChange('fullName', event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
            placeholder="Jane Doe"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Phone</label>
          <input
            value={form.phone}
            onChange={(event) => handleChange('phone', event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
            placeholder="+84 912 345 678"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Address line 1</label>
        <input
          value={form.addressLine1}
          onChange={(event) => handleChange('addressLine1', event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
          placeholder="123 Nguyen Trai, District 1"
          required
        />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Address line 2</label>
        <input
          value={form.addressLine2}
          onChange={(event) => handleChange('addressLine2', event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
          placeholder="Apartment, suite, etc."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">City</label>
          <input
            value={form.city}
            onChange={(event) => handleChange('city', event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
            placeholder="Ho Chi Minh"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">State</label>
          <input
            value={form.state}
            onChange={(event) => handleChange('state', event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
            placeholder="Thu Duc"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Postal code</label>
          <input
            value={form.postalCode}
            onChange={(event) => handleChange('postalCode', event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
            placeholder="700000"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Country</label>
          <input
            value={form.country}
            onChange={(event) => handleChange('country', event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
            placeholder="Vietnam"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Note</label>
        <textarea
          value={form.note}
          onChange={(event) => handleChange('note', event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
          rows={3}
          placeholder="Delivery instructions"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? 'Processing...' : 'Place COD order'}
      </button>
    </form>
  );
};

export default CheckoutForm;
