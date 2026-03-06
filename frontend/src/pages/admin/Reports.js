import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Layout from '../../components/Layout';
import {
  ClipboardList,
  Unlock,
  Settings,
  CheckCircle,
  Flame,
  Calendar,
  BarChart3,
  Target,
  Download
} from 'lucide-react';

export default function Reports() {
  const { token } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await axios.get('https://it-helpdesk-ee86.onrender.com/api/reports/stats', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchStats();
  }, [token]);

  const handleExport = async (type) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const url = `https://it-helpdesk-ee86.onrender.com/api/reports/${type}?${params.toString()}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const blob = await res.blob();

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `incidents-report.${type === 'excel' ? 'xlsx' : 'pdf'}`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Layout>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reports</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Export and analyze incident data
          </p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <Calendar size={16} /> Filter by Date Range
        </h3>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">
              From
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">
              To
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          <button
            onClick={fetchStats}
            className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Apply Filter
          </button>

          {(from || to) && (
            <button
              onClick={() => {
                setFrom('');
                setTo('');
                setTimeout(fetchStats, 100);
              }}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
              {[
                {
                  label: 'Total',
                  value: stats.total,
                  color: 'bg-indigo-50 text-indigo-600',
                  icon: <ClipboardList size={28} />,
                },
                {
                  label: 'Open',
                  value: stats.open,
                  color: 'bg-amber-50 text-amber-600',
                  icon: <Unlock size={28} />,
                },
                {
                  label: 'In Progress',
                  value: stats.inProgress,
                  color: 'bg-blue-50 text-blue-600',
                  icon: <Settings size={28} />,
                },
                {
                  label: 'Resolved',
                  value: stats.resolved,
                  color: 'bg-emerald-50 text-emerald-600',
                  icon: <CheckCircle size={28} />,
                },
                {
                  label: 'SLA Breached',
                  value: stats.breached,
                  color: 'bg-red-50 text-red-600',
                  icon: <Flame size={28} />,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`rounded-2xl p-5 ${s.color} border border-current/10`}
                >
                  <div className="mb-2">{s.icon}</div>
                  <p className="text-3xl font-bold">{s.value}</p>
                  <p className="text-sm font-semibold opacity-80 mt-1">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Category + Priority */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <BarChart3 size={16} /> By Category
                </h3>

                <div className="space-y-3">
                  {Object.entries(stats.byCategory).map(([cat, count]) => (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="text-sm text-slate-600 w-24 shrink-0">
                        {cat}
                      </span>

                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{
                            width: `${stats.total ? (count / stats.total) * 100 : 0}%`,
                          }}
                        />
                      </div>

                      <span className="text-sm font-bold text-slate-700 w-6 text-right">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Target size={16} /> By Priority
                </h3>

                <div className="space-y-3">
                  {Object.entries(stats.byPriority).map(([pri, count]) => {
                    const colors = {
                      critical: 'bg-red-500',
                      high: 'bg-orange-400',
                      medium: 'bg-amber-400',
                      low: 'bg-slate-400',
                    };

                    return (
                      <div key={pri} className="flex items-center gap-3">
                        <span className="text-sm text-slate-600 w-24 shrink-0 capitalize">
                          {pri}
                        </span>

                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              colors[pri] || 'bg-indigo-500'
                            }`}
                            style={{
                              width: `${stats.total ? (count / stats.total) * 100 : 0}%`,
                            }}
                          />
                        </div>

                        <span className="text-sm font-bold text-slate-700 w-6 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )
      )}

      {/* Export */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
          <Download size={16} /> Export Report
        </h3>

        <p className="text-xs text-slate-400 mb-4">
          Download all incidents data with the current filters applied
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
          >
            Export Excel (.xlsx)
          </button>

          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
          >
            Export PDF
          </button>
        </div>
      </div>
    </Layout>
  );
}
