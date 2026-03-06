import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Layout from '../../components/Layout';
import socket from '../../api/socketClient';
import { ArrowLeft, ClipboardList, MessageSquare, MapPin, Users, Settings2, Send, Timer } from 'lucide-react';

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
  high:     'bg-orange-50 text-orange-600',
  critical: 'bg-red-100 text-red-600',
};

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function IncidentDetail() {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const { token, user } = useSelector((s) => s.auth);
  const isEngineer      = user?.role === 'engineer';
  const isAdmin         = user?.role === 'admin';
  const commentEndRef   = useRef(null);

  const [incident,   setIncident]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [comment,    setComment]    = useState('');
  const [sending,    setSending]    = useState(false);
  const [statusLoad, setStatusLoad] = useState(false);
  const [error,      setError]      = useState('');

  const fetchIncident = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/incidents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncident(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load incident');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
    socket.emit('join_incident', id);
    if (user?._id) socket.emit('join_user', user._id);
    socket.on('new_comment', (data) => {
      if (data.incidentId === id) {
        setIncident((prev) =>
          prev ? { ...prev, comments: [...(prev.comments || []), data.comment] } : prev
        );
      }
    });
    socket.on('incident_updated', (data) => {
      if (data.incidentId === id) {
        setIncident((prev) => prev ? { ...prev, ...data.updates } : prev);
      }
    });
    return () => {
      socket.off('new_comment');
      socket.off('incident_updated');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  useEffect(() => {
    commentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [incident?.comments]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSending(true);
    try {
      await axios.post(
        `http://localhost:5000/api/incidents/${id}/comments`,
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment('');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusLoad(true);
    try {
      await axios.put(
        `http://localhost:5000/api/incidents/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIncident((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setStatusLoad(false);
    }
  };

  const backPath = isAdmin ? '/admin/incidents'
    : isEngineer ? '/engineer/incidents'
    : '/employee/incidents';

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  );

  if (error || !incident) return (
    <Layout>
      <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
        {error || 'Incident not found'}
      </div>
    </Layout>
  );

  const slaHrs    = (Date.now() - new Date(incident.createdAt)) / 36e5;
  const slaStatus = slaHrs > 24
    ? { label: 'Breached', cls: 'text-red-500 bg-red-50 border-red-200' }
    : slaHrs > 20
    ? { label: 'At Risk',  cls: 'text-amber-500 bg-amber-50 border-amber-200' }
    : { label: 'On Track', cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' };

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(backPath)}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-indigo-500">
                INC-{incident._id.slice(-4).toUpperCase()}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg capitalize ${STATUS_STYLES[incident.status] || STATUS_STYLES.open}`}>
                {incident.status?.replace('-', ' ')}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg capitalize ${PRIORITY_STYLES[incident.priority] || PRIORITY_STYLES.medium}`}>
                {incident.priority}
              </span>
              <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${slaStatus.cls}`}>
                <Timer size={11} /> SLA: {slaStatus.label}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">{incident.title}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Description + Comments */}
        <div className="lg:col-span-2 space-y-5">

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
              <ClipboardList size={15} className="text-slate-400" /> Description
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {incident.description}
            </p>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-2xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <MessageSquare size={15} className="text-slate-400" /> Comments
                <span className="ml-1 text-xs font-semibold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                  {incident.comments?.length || 0}
                </span>
              </h3>
              <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Live
              </span>
            </div>

            <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
              {(!incident.comments || incident.comments.length === 0) ? (
                <div className="text-center py-8">
                  <MessageSquare size={28} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No comments yet. Be the first to add one!</p>
                </div>
              ) : (
                incident.comments.map((c, idx) => {
                  const isMe = c.addedBy?._id === user?._id || c.addedBy === user?._id;
                  return (
                    <div key={idx} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isMe ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {getInitials(c.addedBy?.name || user?.name || '?')}
                      </div>
                      <div className={`max-w-[75%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                          isMe
                            ? 'bg-indigo-500 text-white rounded-tr-sm'
                            : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                        }`}>
                          {c.text}
                        </div>
                        <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <span className="text-xs text-slate-400 font-medium">
                            {c.addedBy?.name || 'You'}
                          </span>
                          <span className="text-xs text-slate-300">
                            {new Date(c.addedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={commentEndRef} />
            </div>

            <div className="px-6 py-4 border-t border-slate-100">
              <form onSubmit={handleComment} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {getInitials(user?.name || '')}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={sending || !comment.trim()}
                    className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-5">

          {/* Incident Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
              <MapPin size={14} className="text-slate-400" /> Incident Info
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Category',     value: incident.category || '—' },
                { label: 'Created',      value: new Date(incident.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                { label: 'Last Updated', value: new Date(incident.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                { label: 'SLA Deadline', value: incident.slaDeadline ? new Date(incident.slaDeadline).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—' },
                { label: 'Location',     value: incident.location || '—' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                  <span className="text-xs font-semibold text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* People */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
              <Users size={14} className="text-slate-400" /> People
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 mb-1.5">Requester</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                    {getInitials(incident.userId?.name || '')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{incident.userId?.name || '—'}</p>
                    <p className="text-xs text-slate-400">{incident.userId?.email || ''}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1.5">Assigned Engineer</p>
                {incident.engineerId ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">
                      {getInitials(incident.engineerId?.name || '')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{incident.engineerId?.name}</p>
                      <p className="text-xs text-slate-400">{incident.engineerId?.email || ''}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Unassigned</p>
                )}
              </div>
            </div>
          </div>

          {/* Status Update */}
          {(isEngineer || isAdmin) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                <Settings2 size={14} className="text-slate-400" /> Update Status
              </h3>
              <div className="space-y-2">
                {['open', 'in-progress', 'waiting', 'resolved', 'closed'].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={statusLoad || incident.status === s}
                    className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all capitalize ${
                      incident.status === s
                        ? 'bg-indigo-500 text-white border-indigo-500'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    {s.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}