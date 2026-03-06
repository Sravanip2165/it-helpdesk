import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Layout from '../../components/Layout';
import {
  PlusCircle,
  ArrowUpRight,
  Clock,
  Timer,
  RefreshCcw,
  CheckCircle,
  Inbox,
  Calendar
} from 'lucide-react';

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

export default function EmployeeDashboard() {
  const { token, user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/incidents/my', {
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
    loadIncidents();
  }, [token]);

  const stats = {
    total:      incidents.length,
    open:       incidents.filter((i) => i.status === 'open').length,
    inProgress: incidents.filter((i) => i.status === 'in-progress').length,
    resolved:   incidents.filter((i) => i.status === 'resolved' || i.status === 'closed').length,
  };

  const recent = incidents.slice(0, 5);

  return (
    <Layout>

      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-2xl p-8 mb-6 text-white overflow-hidden">
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute right-20 top-1/2 -translate-y-1/2 w-32 h-32 bg-white/10 rounded-full" />

        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1">Welcome back, {user?.name}</h2>
          <p className="text-blue-100 text-sm mb-5">
            Here's what's happening with your incidents today.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/employee/incidents/new')}
              className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              <PlusCircle size={18} />
              Raise New Incident
            </button>

            <button
              onClick={() => navigate('/employee/incidents')}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors border border-white/30"
            >
              View My Incidents
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        {[
          { label: 'Total Incidents', sub: 'All time', value: stats.total, icon: Clock, bg: 'bg-blue-50' },
          { label: 'Open', sub: 'Awaiting response', value: stats.open, icon: Timer, bg: 'bg-amber-50' },
          { label: 'In Progress', sub: 'Being worked on', value: stats.inProgress, icon: RefreshCcw, bg: 'bg-indigo-50' },
          { label: 'Resolved', sub: 'Completed', value: stats.resolved, icon: CheckCircle, bg: 'bg-emerald-50' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all"
            >
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                <Icon size={22} />
              </div>

              <p className="text-base font-semibold text-slate-500 mb-1">{s.label}</p>
              <p className="text-3xl font-extrabold text-slate-900 leading-none mb-1">{s.value}</p>
              <p className="text-xs text-slate-400">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Incidents Table */}
      <div className="bg-white rounded-2xl border border-slate-200">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Incidents</h3>
            <p className="text-xs text-slate-400">Your latest support requests</p>
          </div>

          <button
            onClick={() => navigate('/employee/incidents')}
            className="text-sm font-semibold text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            View all
            <ArrowUpRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recent.length === 0 ? (

          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Inbox size={36} className="mb-2 text-slate-400" />

            <p className="text-slate-600 font-semibold">No incidents yet</p>
            <p className="text-slate-400 text-sm mt-1">
              Raise your first incident to get started
            </p>

            <button
              onClick={() => navigate('/employee/incidents/new')}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
            >
              + Raise Incident
            </button>
          </div>

        ) : (

          <div className="overflow-x-auto">
            <table className="w-full">

              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Issue</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned To</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">

                {recent.map((inc) => (
                  <tr
                    key={inc._id}
                    onClick={() => navigate(`/employee/incidents/${inc._id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-blue-500">
                        INC-{inc._id.slice(-4).toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-4 max-w-[260px]">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {inc.title}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg capitalize ${STATUS_STYLES[inc.status] || STATUS_STYLES.open}`}>
                        {inc.status?.replace('-', ' ')}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg capitalize ${PRIORITY_STYLES[inc.priority] || PRIORITY_STYLES.medium}`}>
                        {inc.priority}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {inc.engineerId?.name || <span className="text-slate-400 italic">Unassigned</span>}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400 flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(inc.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </td>

                  </tr>
                ))}

              </tbody>
            </table>
          </div>

        )}
      </div>
    </Layout>
  );
}