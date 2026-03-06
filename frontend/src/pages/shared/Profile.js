import React from 'react';
import { useSelector } from 'react-redux';
import Layout from '../../components/Layout';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function Profile() {
  const { user, role } = useSelector((s) => s.auth);

  const roleLabel = role === 'admin' ? 'Administrator'
    : role === 'engineer' ? 'IT Engineer'
    : 'Employee';

  const roleColor = role === 'admin'    ? 'bg-red-100 text-red-600'
    : role === 'engineer' ? 'bg-purple-100 text-purple-600'
    : 'bg-blue-100 text-blue-600';

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
          <p className="text-sm text-slate-400 mt-0.5">Your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-5">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-indigo-500 to-purple-600" />

          {/* Avatar row */}
          <div className="px-6 pt-0 pb-6">
            <div className="flex items-end gap-4" style={{ marginTop: '-40px' }}>
              <div className="w-20 h-20 rounded-2xl border-4 border-white bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 shadow-md shrink-0">
                {getInitials(user?.name)}
              </div>
            </div>

            <div className="mt-3">
              <h3 className="text-xl font-bold text-slate-900">{user?.name || '—'}</h3>
              <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mt-1 ${roleColor}`}>
                {roleLabel}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email</p>
                <p className="text-sm font-semibold text-slate-800 break-all">{user?.email || '—'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Role</p>
                <p className="text-sm font-semibold text-slate-800">{roleLabel}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Department</p>
                <p className="text-sm font-semibold text-slate-800">{user?.department || '—'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Account Status</p>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills for engineers */}
        {role === 'engineer' && user?.skills?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
            <h3 className="text-sm font-bold text-slate-700 mb-3">🎯 My Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((s) => (
                <span key={s} className="text-sm bg-purple-50 text-purple-600 px-3 py-1.5 rounded-xl font-semibold border border-purple-100">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Account Security */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-700 mb-3">🔒 Account Security</h3>
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="text-sm font-semibold text-slate-700">Password</p>
              <p className="text-xs text-slate-400">Protected</p>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg tracking-widest">••••••••</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">Account ID</p>
              <p className="text-xs text-slate-400">Your unique identifier</p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
              {user?._id ? user._id.slice(-8).toUpperCase() : 'LOGIN AGAIN'}
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
