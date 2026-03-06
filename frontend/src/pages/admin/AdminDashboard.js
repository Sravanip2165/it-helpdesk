import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import Layout from '../../components/Layout';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Bug, Users, Monitor, AlertTriangle, CheckCircle } from 'lucide-react';

const weeklyData = [
  { day: 'Mon', open: 12, resolved: 10 },
  { day: 'Tue', open: 8,  resolved: 14 },
  { day: 'Wed', open: 15, resolved: 11 },
  { day: 'Thu', open: 10, resolved: 13 },
  { day: 'Fri', open: 7,  resolved: 9  },
  { day: 'Sat', open: 3,  resolved: 5  },
  { day: 'Sun', open: 2,  resolved: 4  },
];

const categoryData = [
  { name: 'Hardware', value: 35, color: '#6366f1' },
  { name: 'Software', value: 28, color: '#10b981' },
  { name: 'Network',  value: 20, color: '#f59e0b' },
  { name: 'Access',   value: 17, color: '#8b5cf6' },
];

const topEngineers = [
  { name: 'Mike Chen',  resolved: 24, avgTime: '1.8h', initials: 'MC' },
  { name: 'Sarah Lee',  resolved: 21, avgTime: '2.1h', initials: 'SL' },
  { name: 'James Park', resolved: 18, avgTime: '2.4h', initials: 'JP' },
  { name: 'Lisa Wang',  resolved: 15, avgTime: '1.6h', initials: 'LW' },
];

const recentActivity = [
  { action: 'New employee added',  detail: 'John Smith - Engineering',        time: '5m ago'  },
  { action: 'Asset assigned',      detail: 'MacBook Pro 16 to Maria Garcia',  time: '12m ago' },
  { action: 'SLA breach alert',    detail: 'INC-1018 exceeded 4h window',     time: '25m ago' },
  { action: 'Incident resolved',   detail: 'INC-1015 - SharePoint access',    time: '1h ago'  },
  { action: 'Security audit',      detail: 'Monthly access review completed', time: '2h ago'  },
];

function StatCard({ label, value, iconBg, change, changeColor, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-default">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
        <p className="text-3xl font-extrabold text-slate-900 leading-none mb-1">{value}</p>
        <p className={`text-xs font-semibold ${changeColor}`}>{change}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { token } = useSelector((state) => state.auth);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/dashboard/admin', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        setError('Failed to load: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-4">{error}</div>
    </Layout>
  );

  const trendData = stats?.incidentsPerMonth || [];

  return (
    <Layout>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <StatCard
          label="Total Incidents"
          value={stats?.totalIncidents || 0}
          icon={<Bug size={28} className="text-indigo-600" />} iconBg="bg-indigo-50"
          change="+12% from last month" changeColor="text-emerald-500"
        />
        <StatCard
          label="Active Users"
          value={stats?.totalUsers || 0}
          icon={<Users size={28} className="text-blue-600" />} iconBg="bg-blue-50"
          change="Engineers & Employees" changeColor="text-slate-400"
        />
        <StatCard
          label="Assets Managed"
          value={stats?.totalAssets || 0}
          icon={<Monitor size={28} className="text-emerald-600" />} iconBg="bg-emerald-50"
          change="Tracked & assigned" changeColor="text-slate-400"
        />
        <StatCard
          label="SLA Breaches"
          value={stats?.slaBreaches || 0}
          icon={<AlertTriangle size={28} className="text-amber-600" />} iconBg="bg-amber-50"
          change="Monitor closely" changeColor="text-amber-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

        {/* Weekly Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900">Weekly Overview</h3>
          <p className="text-sm text-slate-400 mb-5">Incidents opened vs resolved this week</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyData} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} tick={{ fill: '#94a3b8' }} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} tick={{ fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} cursor={{ fill: 'rgba(99,102,241,0.04)' }} />
              <Bar dataKey="open"     fill="#f59e0b" radius={[6,6,0,0]} barSize={26} name="Opened" />
              <Bar dataKey="resolved" fill="#10b981" radius={[6,6,0,0]} barSize={26} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Line Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900">Incident Trend</h3>
          <p className="text-sm text-slate-400 mb-5">6-month incident volume</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} tick={{ fill: '#94a3b8' }} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} tick={{ fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3}
                dot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 7 }} name="Incidents" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900">By Category</h3>
          <p className="text-sm text-slate-400 mb-2">Incident distribution</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name"
                cx="50%" cy="50%" innerRadius={60} outerRadius={95} strokeWidth={3} stroke="white">
                {categoryData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-slate-500">{cat.name}</span>
                <span className="text-xs font-bold text-slate-800">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Engineers */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Top Engineers</h3>
              <p className="text-sm text-slate-400">This month's leaders</p>
            </div>
            <button className="text-sm font-semibold text-indigo-500 hover:text-indigo-700 transition-colors">
              View all →
            </button>
          </div>
          <div className="space-y-2">
            {topEngineers.map((eng, idx) => (
              <div key={eng.name} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-colors">
                <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}</span>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-indigo-600">{eng.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{eng.name}</p>
                  <p className="text-xs text-slate-400">Avg: {eng.avgTime}</p>
                </div>
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg whitespace-nowrap">
                  {eng.resolved} resolved
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
          <p className="text-sm text-slate-400 mb-5">Latest system events</p>
          <div className="space-y-2">
            {recentActivity.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle size={18} className="text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{item.action}</p>
                  <p className="text-xs text-slate-400 truncate">{item.detail}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </Layout>
  );
}