import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Search, ArrowUpDown, Eye, Flame, CheckCircle2, Timer } from 'lucide-react';

const STATUS_STYLES = {
  open:          'bg-amber-50 text-amber-600 border border-amber-200',
  'in-progress': 'bg-blue-50 text-blue-600 border border-blue-200',
  waiting:       'bg-slate-100 text-slate-500 border border-slate-200',
  resolved:      'bg-emerald-50 text-emerald-600 border border-emerald-200',
  closed:        'bg-slate-100 text-slate-400 border border-slate-200',
};

const PRIORITY_STYLES = {
  critical: 'bg-red-500 text-white',
  high:     'bg-orange-100 text-orange-600',
  medium:   'bg-amber-50 text-amber-600',
  low:      'bg-slate-100 text-slate-500',
};

function getSLA(createdAt) {
  const hrs       = (Date.now() - new Date(createdAt)) / 36e5;
  const remaining = 24 - hrs;
  if (remaining <= 0) return {
    label: 'BREACHED', labelColor: 'text-red-500',
    bar: 100, barColor: 'bg-red-500', breached: true,
  };
  const pct      = Math.max(0, Math.min(100, (1 - remaining / 24) * 100));
  const barColor = remaining < 1 ? 'bg-red-500' : remaining < 4 ? 'bg-amber-400' : 'bg-emerald-400';
  const label    = remaining < 1
    ? `${Math.round(remaining * 60)}m left`
    : `${Math.floor(remaining)}h ${Math.round((remaining % 1) * 60)}m left`;
  const labelColor = remaining < 1 ? 'text-red-500' : remaining < 4 ? 'text-amber-500' : 'text-slate-500';
  return { label, labelColor, bar: pct, barColor, breached: false };
}

export default function AssignedIncidents() {
  const { token }   = useSelector((s) => s.auth);
  const navigate    = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('all');
  const [sortSLA,   setSortSLA]   = useState(true);

  const fetchIncidents = () => {
    setLoading(true);
    axios.get('https://it-helpdesk-ee86.onrender.com/api/incidents/assigned', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      const d = Array.isArray(res.data) ? res.data : res.data.incidents || res.data.data || [];
      setIncidents(d);
    }).catch(console.error).finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchIncidents(); }, [token]);

  const filtered = incidents
    .filter((i) => {
      const matchSearch = !search ||
        i.title?.toLowerCase().includes(search.toLowerCase()) ||
        i._id?.toLowerCase().includes(search.toLowerCase()) ||
        i.userId?.name?.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'all' || i.status === filter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => sortSLA
      ? (Date.now() - new Date(b.createdAt)) - (Date.now() - new Date(a.createdAt))
      : new Date(b.createdAt) - new Date(a.createdAt));

  const FILTERS = [
    { key: 'all',         label: 'All'         },
    { key: 'open',        label: 'Open'        },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'waiting',     label: 'Waiting'     },
  ];

  return (
    <Layout>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Assigned Tickets</h2>
          <p className="text-sm text-slate-400 mt-0.5">Manage and resolve your assigned support tickets</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                filter === f.key ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSortSLA(!sortSLA)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
            sortSLA ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
          }`}
        >
          <ArrowUpDown size={15} /> SLA Urgency
        </button>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200 text-center">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-slate-600 font-semibold">
            {search || filter !== 'all' ? 'No tickets match your filters' : 'No tickets assigned yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inc) => {
            const sla        = getSLA(inc.createdAt);
            const isResolved = inc.status === 'resolved' || inc.status === 'closed';
            return (
              <div
                key={inc._id}
                className={`bg-white rounded-2xl border transition-all hover:shadow-md ${
                  sla.breached && !isResolved ? 'border-red-200' : 'border-slate-200'
                }`}
              >
                <div className="p-5">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-sm font-bold text-indigo-500">
                        INC-{inc._id.slice(-4).toUpperCase()}
                      </span>
                      <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg capitalize ${STATUS_STYLES[inc.status] || STATUS_STYLES.open}`}>
                        {inc.status?.replace('-', ' ')}
                      </span>
                      {inc.category && (
                        <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-lg">
                          {inc.category}
                        </span>
                      )}
                      {(inc.priority === 'critical' || inc.priority === 'high') && (
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg uppercase ${PRIORITY_STYLES[inc.priority]}`}>
                          {inc.priority}
                        </span>
                      )}
                    </div>
                    <div className="shrink-0">
                      {isResolved ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                          <CheckCircle2 size={14} /> Resolved
                        </span>
                      ) : sla.breached ? (
                        <span className="flex items-center gap-1 text-sm font-bold text-red-500">
                          <Flame size={14} /> BREACHED
                        </span>
                      ) : (
                        <span className={`flex items-center gap-1 text-sm font-semibold ${sla.labelColor}`}>
                          <Timer size={14} /> {sla.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title + description */}
                  <h3 className="text-base font-bold text-slate-900 mt-3 mb-1">{inc.title}</h3>
                  {inc.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{inc.description}</p>
                  )}

                  {/* Requester */}
                  <div className="flex items-center gap-3 mb-3">
                    {inc.userId?.name && (
                      <>
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-indigo-600">
                            {inc.userId.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-slate-600">{inc.userId.name}</span>
                        {inc.userId.department && (
                          <>
                            <span className="text-slate-300">|</span>
                            <span className="text-xs text-slate-400">{inc.userId.department}</span>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {/* SLA bar + View button */}
                  <div className="flex items-center gap-4">
                    {!isResolved && (
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${sla.barColor}`} style={{ width: `${sla.bar}%` }} />
                      </div>
                    )}
                    <button
                      onClick={() => navigate(`/engineer/incidents/${inc._id}`)}
                      className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors ml-auto"
                    >
                      <Eye size={15} /> View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
