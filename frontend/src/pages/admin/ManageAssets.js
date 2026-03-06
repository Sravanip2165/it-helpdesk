import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { 
  Laptop, Monitor, Printer, Smartphone, Headphones, Tablet, 
  Box, CheckCircle, Circle, Wrench, Search, MoreHorizontal, 
  Trash2, Plus, X 
} from 'lucide-react';
import Layout from '../../components/Layout';

const STATUS_STYLES = {
  assigned:    'bg-blue-50 text-blue-600 border border-blue-200',
  available:   'bg-emerald-50 text-emerald-600 border border-emerald-200',
  maintenance: 'bg-amber-50 text-amber-600 border border-amber-200',
};

const TYPE_ICONS = {
  laptop:  <Laptop size={20} />,
  monitor: <Monitor size={20} />,
  printer: <Printer size={20} />,
  phone:   <Smartphone size={20} />,
  headset: <Headphones size={20} />,
  tablet:  <Tablet size={20} />,
  other:   <Box size={20} />,
};

export default function ManageAssets() {
  const { token } = useSelector((s) => s.auth);

  const [assets,        setAssets]       = useState([]);
  const [loading,       setLoading]      = useState(true);
  const [error,         setError]        = useState('');
  const [search,        setSearch]       = useState('');
  const [statusFilter,setStatusFilter]   = useState('all');
  const [menuOpen,      setMenuOpen]     = useState(null);
  const [showAdd,       setShowAdd]      = useState(false);
  const [showDelete,    setShowDelete]   = useState(null);
  const [formLoading, setFormLoading]    = useState(false);
  const [formError,     setFormError]    = useState('');

  const [form, setForm] = useState({
    name: '', type: 'laptop', serialNumber: '',
    location: '', assignedTo: '', status: 'available',
    purchaseDate: '', warrantyExpiry: '',
  });

  const fetchAssets = async () => {
    try {
      const res = await axios.get('https://it-helpdesk-ee86.onrender.com/api/assets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssets(Array.isArray(res.data) ? res.data : res.data.assets || res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, [token]);

  useEffect(() => {
    const handler = () => setMenuOpen(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const filtered = assets.filter((a) => {
    const matchSearch = !search ||
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.serialNumber?.toLowerCase().includes(search.toLowerCase()) ||
      a.assignedTo?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total:       assets.length,
    assigned:    assets.filter((a) => a.status === 'assigned').length,
    available:   assets.filter((a) => a.status === 'available').length,
    maintenance: assets.filter((a) => a.status === 'maintenance').length,
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      await axios.post('https://it-helpdesk-ee86.onrender.com/api/assets', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowAdd(false);
      setForm({ name: '', type: 'laptop', serialNumber: '', location: '', assignedTo: '', status: 'available', purchaseDate: '', warrantyExpiry: '' });
      fetchAssets();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://it-helpdesk-ee86.onrender.com/api/assets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDelete(null);
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`https://it-helpdesk-ee86.onrender.com/api/assets/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuOpen(null);
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Asset Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">Track and manage company IT assets</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Asset
        </button>
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap gap-3 mb-5">
        {[
          { label: 'Total Assets',    value: counts.total,     filter: 'all',         icon: <Box size={16} /> },
          { label: 'Assigned',        value: counts.assigned,    filter: 'assigned',    icon: <CheckCircle size={16} /> },
          { label: 'Available',       value: counts.available,   filter: 'available',   icon: <Circle size={16} /> },
          { label: 'In Maintenance',  value: counts.maintenance, filter: 'maintenance', icon: <Wrench size={16} /> },
        ].map((s) => (
          <button
            key={s.filter}
            onClick={() => setStatusFilter(s.filter)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
              statusFilter === s.filter
                ? 'bg-indigo-500 text-white border-indigo-500'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {s.icon} {s.label}: <span className="font-bold">{s.value}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search by name, ID, or serial..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
        />
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-4 text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200 text-center">
          <Box size={48} className="text-slate-300 mb-3" />
          <p className="text-slate-600 font-semibold">No assets found</p>
          <p className="text-slate-400 text-sm mt-1">
            {search ? 'Try a different search' : 'Add your first asset to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((asset) => {
            const icon = TYPE_ICONS[asset.type] || TYPE_ICONS.other;
            const statusStyle = STATUS_STYLES[asset.status] || STATUS_STYLES.available;
            return (
              <div key={asset._id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      {icon}
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyle}`}>
                      {asset.status}
                    </span>
                  </div>

                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === asset._id ? null : asset._id); }}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    {menuOpen === asset._id && (
                      <div className="absolute right-0 top-10 w-44 bg-white rounded-xl border border-slate-200 shadow-xl z-20 overflow-hidden">
                        <div className="p-1">
                          <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Change Status</p>
                          {['available', 'assigned', 'maintenance'].filter((s) => s !== asset.status).map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(asset._id, s)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors capitalize"
                            >
                              Mark {s}
                            </button>
                          ))}
                        </div>
                        <div className="border-t border-slate-100 p-1">
                          <button
                            onClick={() => { setShowDelete(asset); setMenuOpen(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-0.5">{asset.name}</h3>
                {asset.model && <p className="text-xs text-slate-400 mb-3">{asset.model}</p>}

                <div className="space-y-1.5 text-sm text-slate-500">
                  {asset.serialNumber && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-400">S/N:</span>
                      <span className="font-mono text-xs">{asset.serialNumber}</span>
                    </div>
                  )}
                  {asset.location && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">📍</span><span>{asset.location}</span>
                    </div>
                  )}
                  {asset.assignedTo?.name && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">👤</span><span>{asset.assignedTo.name}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Asset Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-slate-900">Add New Asset</h3>
              <button onClick={() => { setShowAdd(false); setFormError(''); }}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{formError}</div>
              )}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Asset Name *</label>
                <input type="text" required placeholder="MacBook Pro 16"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 cursor-pointer">
                    <option value="laptop">Laptop</option>
                    <option value="monitor">Monitor</option>
                    <option value="printer">Printer</option>
                    <option value="phone">Phone</option>
                    <option value="headset">Headset</option>
                    <option value="tablet">Tablet</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 cursor-pointer">
                    <option value="available">Available</option>
                    <option value="assigned">Assigned</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Serial Number</label>
                <input type="text" placeholder="SN-XXXXXXXX"
                  value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Location</label>
                <input type="text" placeholder="Floor 2, Desk 24"
                  value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Purchase Date</label>
                  <input type="date"
                    value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Warranty Expiry</label>
                  <input type="date"
                    value={form.warrantyExpiry} onChange={(e) => setForm({ ...form, warrantyExpiry: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAdd(false); setFormError(''); }}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading}
                  className="flex-1 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                  {formLoading ? 'Adding...' : 'Add Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Asset</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-800">{showDelete.name}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(null)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(showDelete._id)}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
