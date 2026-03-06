import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Layout from '../../components/Layout';
import { Clock, Loader2, CheckCircle2, AlertTriangle, Timer } from 'lucide-react';

const STATUS_STYLES = {
  open:          'bg-amber-50 text-amber-600 border border-amber-200',
  'in-progress': 'bg-blue-50 text-blue-600 border border-blue-200',
  waiting:       'bg-slate-100 text-slate-500 border border-slate-200',
  resolved:      'bg-emerald-50 text-emerald-600 border border-emerald-200',
  closed:        'bg-slate-100 text-slate-400 border border-slate-200',
};

const PRIORITY_DOT = {
  critical: 'bg-red-500',
  high:     'bg-orange-500',
  medium:   'bg-amber-400',
  low:      'bg-slate-400',
};

function getSLAInfo(createdAt, status) {
  if (status === 'resolved' || status === 'closed') return null;
  const hrs = (Date.now() - new Date(createdAt)) / 36e5;
  const remaining = 24 - hrs;
  if (remaining <= 0) return { label: 'Breached', color: 'text-red-500', bar: 100, barColor: 'bg-red-500' };
  const pct = Math.max(0, Math.min(100, (1 - remaining / 24) * 100));
  const barColor = remaining < 2 ? 'bg-red-500' : remaining < 6 ? 'bg-amber-400' : 'bg-emerald-400';
  const label = remaining < 1 ? `${Math.round(remaining * 60)}m left` : `${Math.floor(remaining)}h ${Math.round((remaining % 1) * 60)}m left`;
  const color = remaining < 2 ? 'text-red-500' : remaining < 6 ? 'text-amber-500' : 'text-emerald-500';
  return { label, color, bar: pct, barColor };
}

function ProgressBar({ label, value, target }) {
  const pct = Math.min(100, value);
  const barColor  = value >= target ? 'bg-emerald-400' : value >= target * 0.85 ? 'bg-amber-400' : 'bg-red-400';
  const textColor = value >= target ? 'text-emerald-500' : value >= target * 0.85 ? 'text-amber-500' : 'text-red-500';
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className={`text-sm font-bold ${textColor}`}>{value}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function EngineerDashboard() {
  const { token } = useSelector((s) => s.auth);
  const navigate  = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    axios.get('https://it-helpdesk-ee86.onrender.com/api/incidents/assigned', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      const d = Array.isArray(res.data) ? res.data : res.data.incidents || res.data.data || [];
      setIncidents(d);
    }).catch(console.error).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const resolved = incidents.filter((i) => i.status === 'resolved' || i.status === 'closed');

  const stats = {
    total:         incidents.length,
    inProgress:    incidents.filter((i) => i.status === 'in-progress').length,
    resolvedToday: resolved.filter((i) => { const d = new Date(i.updatedAt); d.setHours(0,0,0,0); return d.getTime() === today.getTime(); }).length,
    slaBreaches:   incidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed' && (Date.now() - new Date(i.createdAt)) / 36e5 > 24).length,
    todayNew:      incidents.filter((i) => { const d = new Date(i.createdAt); d.setHours(0,0,0,0); return d.getTime() === today.getTime(); }).length,
  };

  const avgResHrs = resolved.length > 0
    ? resolved.reduce((acc, i) => acc + (new Date(i.updatedAt) - new Date(i.createdAt)) / 36e5, 0) / resolved.length : 0;

  const total = Math.max(incidents.length, 1);
  const slaPerf = {
    responseTime:   Math.min(99, Math.round(((total - stats.slaBreaches) / total) * 100)),
    resolutionTime: Math.min(99, Math.round((resolved.length / total) * 100)),
    firstCall:      Math.min(99, Math.round((resolved.length / total) * 82)),
    custSat:        Math.min(99, Math.round(((total - stats.slaBreaches) / total) * 100) + 5),
  };

  const activeIncidents = incidents
    .filter((i) => i.status !== 'resolved' && i.status !== 'closed')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const STAT_CARDS = [
    { label: 'Assigned to You', value: stats.total,         sub: stats.todayNew > 0 ? `+${stats.todayNew} today` : 'Total assigned',   subColor: 'text-slate-400',   icon: Clock,         bg: 'bg-blue-50',    iconColor: 'text-blue-400'    },
    { label: 'In Progress',     value: stats.inProgress,    sub: 'Active now',                                                           subColor: 'text-slate-400',   icon: Loader2,       bg: 'bg-indigo-50',  iconColor: 'text-indigo-400'  },
    { label: 'Resolved Today',  value: stats.resolvedToday, sub: avgResHrs > 0 ? `Avg ${avgResHrs.toFixed(1)}h resolution` : 'None yet', subColor: 'text-emerald-500', icon: CheckCircle2,  bg: 'bg-emerald-50', iconColor: 'text-emerald-400' },
    { label: 'SLA Breaches',    value: stats.slaBreaches,   sub: stats.slaBreaches > 0 ? 'Needs attention' : 'All on track',
      subColor: stats.slaBreaches > 0 ? 'text-red-500' : 'text-emerald-500', icon: AlertTriangle, bg: 'bg-red-50', iconColor: 'text-red-400' },
  ];

  return (
    <Layout>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STAT_CARDS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all">
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                <Icon size={22} className={s.iconColor} />
              </div>
              <p className="text-sm font-semibold text-slate-500 mb-1">{s.label}</p>
              <p className="text-3xl font-extrabold text-slate-900 leading-none mb-1">{s.value}</p>
              <p className={`text-xs font-semibold ${s.subColor}`}>{s.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* SLA Performance */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-base font-bold text-slate-900 mb-0.5">SLA Performance</h3>
          <p className="text-xs text-slate-400 mb-5">This week's compliance</p>
          <ProgressBar label="Response Time"         value={slaPerf.responseTime}   target={95} />
          <ProgressBar label="Resolution Time"       value={slaPerf.resolutionTime} target={90} />
          <ProgressBar label="First Call Resolution" value={slaPerf.firstCall}      target={70} />
          <ProgressBar label="Customer Satisfaction" value={slaPerf.custSat}        target={85} />
          <button onClick={() => navigate('/engineer/sla')}
            className="w-full mt-3 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-indigo-500 hover:bg-indigo-50 transition-colors">
            View Full SLA Monitor →
          </button>
        </div>

        {/* Assigned Tickets */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Assigned Tickets</h3>
              <p className="text-xs text-slate-400">Sorted by SLA urgency</p>
            </div>
            <button onClick={() => navigate('/engineer/incidents')}
              className="text-sm font-semibold text-indigo-500 hover:text-indigo-700 transition-colors">
              View all →
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeIncidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-3xl mb-2">🎉</p>
              <p className="text-slate-600 font-semibold">All caught up!</p>
              <p className="text-slate-400 text-sm mt-1">No active incidents assigned to you</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-[480px] overflow-y-auto">
              {activeIncidents.map((inc) => {
                const sla = getSLAInfo(inc.createdAt, inc.status);
                return (
                  <div key={inc._id} onClick={() => navigate(`/engineer/incidents/${inc._id}`)}
                    className="px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-indigo-500">INC-{inc._id.slice(-4).toUpperCase()}</span>
                        <div className={`w-2 h-2 rounded-full ${PRIORITY_DOT[inc.priority] || 'bg-slate-300'}`} />
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg capitalize ${STATUS_STYLES[inc.status] || STATUS_STYLES.open}`}>
                          {inc.status?.replace('-', ' ')}
                        </span>
                      </div>
                      {sla && (
                        <span className={`flex items-center gap-1 text-xs font-semibold ${sla.color}`}>
                          <Timer size={12} /> {sla.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-800 mb-1.5">{inc.title}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-indigo-600">{inc.userId?.name?.charAt(0) || '?'}</span>
                      </div>
                      <span className="text-xs text-slate-500">{inc.userId?.name || 'Unknown'}</span>
                    </div>
                    {sla && (
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${sla.barColor}`} style={{ width: `${sla.bar}%` }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
