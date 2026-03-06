import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Layout from '../../components/Layout';

const STATUS_STYLES = {
  open:          'bg-amber-50 text-amber-600 border border-amber-200',
  'in-progress': 'bg-blue-50 text-blue-600 border border-blue-200',
  waiting:       'bg-slate-100 text-slate-500 border border-slate-200',
  resolved:      'bg-emerald-50 text-emerald-600 border border-emerald-200',
  closed:        'bg-slate-100 text-slate-400 border border-slate-200',
};

const PRIORITY_STYLES = {
  low:      'bg-slate-100 text-slate-500',
  medium:   'bg-amber-50 text-amber-600',
  high:     'bg-red-50 text-red-500',
  critical: 'bg-red-100 text-red-700',
};

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export default function MyIncidents() {
  const { token } = useSelector((s) => s.auth);
  const navigate  = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [status,    setStatus]    = useState('all');
  const [priority,  setPriority]  = useState('all');
  const [sortBy,    setSortBy]    = useState('date'); // date | priority

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('https://it-helpdesk-ee86.onrender.com/api/incidents/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(res.data) ? res.data
          : res.data.incidents || res.data.data || [];
        setIncidents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token]);

  const filtered = incidents
    .filter((i) => {
      const matchSearch = !search ||
        i.title?.toLowerCase().includes(search.toLowerCase()) ||
        i._id?.toLowerCase().includes(search.toLowerCase());
      const matchStatus   = status   === 'all' || i.status   === status;
      const matchPriority = priority === 'all' || i.priority === priority;
      return matchSearch && matchStatus && matchPriority;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        return (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Incidents</h2>
          <p className="text-sm text-slate-400 mt-0.5">Track and manage all your submitted incidents</p>
        </div>
        <button
          onClick={() => navigate('/employee/incidents/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          + Raise New Incident
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by ID or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-blue-400 cursor-pointer"
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
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-blue-400 cursor-pointer"
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        {/* Sort toggle */}
        <button
          onClick={() => setSortBy(sortBy === 'date' ? 'priority' : 'date')}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-blue-300 transition-colors font-medium"
          title="Toggle sort"
        >
          ⇅
        </button>
      </div>

      {/* Count + Sort label */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of <span className="font-semibold text-slate-700">{incidents.length}</span> incidents
        </p>
        <p className="text-xs text-slate-400">Sorted by: <span className="font-semibold capitalize">{sortBy}</span></p>
      </div>

      {/* Incidents List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200 text-center">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-slate-600 font-semibold">No incidents found</p>
          <p className="text-slate-400 text-sm mt-1">
            {search || status !== 'all' || priority !== 'all'
              ? 'Try adjusting your filters'
              : 'You haven\'t raised any incidents yet'}
          </p>
          {!search && status === 'all' && priority === 'all' && (
            <button
              onClick={() => navigate('/employee/incidents/new')}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
            >
              + Raise First Incident
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inc) => (
            <div
              key={inc._id}
              onClick={() => navigate(`/employee/incidents/${inc._id}`)}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 cursor-pointer transition-all"
            >
              {/* Top row: badges + meta */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-sm font-bold text-blue-500">
                    INC-{inc._id.slice(-4).toUpperCase()}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg capitalize ${STATUS_STYLES[inc.status] || STATUS_STYLES.open}`}>
                    {inc.status?.replace('-', ' ')}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg capitalize ${PRIORITY_STYLES[inc.priority] || PRIORITY_STYLES.medium}`}>
                    {inc.priority}
                  </span>
                  {inc.category && (
                    <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-lg">
                      {inc.category}
                    </span>
                  )}
                </div>

                {/* Right meta */}
                <div className="text-right text-xs text-slate-400 shrink-0 space-y-1">
                  <p>📅 {new Date(inc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  <p>👤 {inc.engineerId?.name || 'Unassigned'}</p>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-slate-900 mt-3 mb-1">{inc.title}</h3>

              {/* Description preview */}
              {inc.description && (
                <p className="text-sm text-slate-500 line-clamp-2">{inc.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
