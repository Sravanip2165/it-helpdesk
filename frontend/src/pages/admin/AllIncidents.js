import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Layout from '../../components/Layout';

const STATUS_STYLES = {
  open:        'bg-amber-50  text-amber-600  border border-amber-200',
  'in-progress':'bg-blue-50   text-blue-600   border border-blue-200',
  waiting:     'bg-slate-50  text-slate-500  border border-slate-200',
  resolved:    'bg-emerald-50 text-emerald-600 border border-emerald-200',
  closed:      'bg-slate-100 text-slate-500  border border-slate-200',
};

const PRIORITY_DOT = {
  low:      'bg-slate-400',
  medium:   'bg-amber-400',
  high:     'bg-orange-500',
  critical: 'bg-red-500',
};

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function getSLA(createdAt, status) {
  if (status === 'resolved' || status === 'closed') return { label: 'Resolved', cls: 'text-emerald-600' };
  const hrs = (Date.now() - new Date(createdAt)) / 36e5;
  if (hrs > 24) return { label: 'Breached', cls: 'text-red-500' };
  if (hrs > 20) return { label: 'At Risk',  cls: 'text-amber-500' };
  return { label: 'On Track', cls: 'text-emerald-500' };
}

export default function AllIncidents() {
  const { token } = useSelector((s) => s.auth);
  const navigate  = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [search,    setSearch]    = useState('');
  const [status,    setStatus]    = useState('all');
  const [priority,  setPriority]  = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('https://it-helpdesk-ee86.onrender.com/api/incidents', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIncidents(Array.isArray(res.data) ? res.data : res.data.incidents || res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token]);

  const filtered = incidents.filter((inc) => {
    const matchSearch =
      !search ||
      inc.title?.toLowerCase().includes(search.toLowerCase()) ||
      inc._id?.toLowerCase().includes(search.toLowerCase()) ||
      inc.userId?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus   = status   === 'all' || inc.status   === status;
    const matchPriority = priority === 'all' || inc.priority === priority;
    return matchSearch && matchStatus && matchPriority;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Title', 'Requester', 'Assigned To', 'Status', 'Priority', 'Date'];
    const rows = filtered.map((inc) => [
      inc._id,
      inc.title,
      inc.userId?.name || '-',
      inc.engineerId?.name || 'Unassigned',
      inc.status,
      inc.priority,
      new Date(inc.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'incidents.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">All Incidents</h2>
          <p className="text-sm text-slate-400 mt-0.5">View and manage all incidents across the organization</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by ID, title, or requester..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-indigo-400 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="waiting">Waiting</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-indigo-400 cursor-pointer"
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-600 font-semibold">No incidents found</p>
            <p className="text-slate-400 text-sm mt-1">
              {search || status !== 'all' || priority !== 'all'
                ? 'Try adjusting your filters'
                : 'No incidents have been raised yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Issue</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Requester</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned To</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">SLA</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((inc) => {
                  const sla = getSLA(inc.createdAt, inc.status);
                  return (
                    <tr
                      key={inc._id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/incidents/${inc._id}`)}
                    >
                      {/* ID */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-indigo-500">
                          INC-{inc._id.slice(-4).toUpperCase()}
                        </span>
                      </td>

                      {/* Issue */}
                      <td className="px-6 py-4 max-w-[220px]">
                        <p className="text-sm font-semibold text-slate-800 truncate">{inc.title}</p>
                        {inc.category && (
                          <span className="inline-block mt-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {inc.category}
                          </span>
                        )}
                      </td>

                      {/* Requester */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-bold text-indigo-600">
                              {getInitials(inc.userId?.name)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{inc.userId?.name || '—'}</p>
                            <p className="text-xs text-slate-400">{inc.userId?.email || ''}</p>
                          </div>
                        </div>
                      </td>

                      {/* Assigned To */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">
                          {inc.engineerId?.name || (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${STATUS_STYLES[inc.status] || STATUS_STYLES.open}`}>
                          {inc.status?.replace('-', ' ')}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${PRIORITY_DOT[inc.priority] || 'bg-slate-400'}`} />
                          <span className="text-sm text-slate-700 capitalize">{inc.priority}</span>
                        </div>
                      </td>

                      {/* SLA */}
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold ${sla.cls}`}>
                          ⏱ {sla.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">
                          {new Date(inc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer count */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-400">
                Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of <span className="font-semibold text-slate-600">{incidents.length}</span> incidents
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
