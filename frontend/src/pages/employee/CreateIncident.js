import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Layout from '../../components/Layout';
import { Monitor, Terminal, Wifi, KeyRound, Database, Headphones, AlertTriangle, Upload, Paperclip, X, Info } from 'lucide-react';

const CATEGORIES = [
  { value: 'Hardware', label: 'Hardware Issue',  desc: 'Laptop, monitor, keyboard, mouse, etc.',      icon: Monitor,    color: 'text-blue-500',    bg: 'bg-blue-50'    },
  { value: 'Software', label: 'Software Issue',  desc: 'Application crashes, installation, licenses', icon: Terminal,   color: 'text-violet-500',  bg: 'bg-violet-50'  },
  { value: 'Network',  label: 'Network Issue',   desc: 'VPN, Wi-Fi, internet connectivity',           icon: Wifi,       color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { value: 'Access',   label: 'Access Request',  desc: 'Permissions, folder access, account setup',   icon: KeyRound,   color: 'text-amber-500',   bg: 'bg-amber-50'   },
  { value: 'Storage',  label: 'Storage',         desc: 'Disk space, cloud storage, file recovery',    icon: Database,   color: 'text-rose-500',    bg: 'bg-rose-50'    },
  { value: 'Other',    label: 'Other',           desc: 'General IT support requests',                 icon: Headphones, color: 'text-slate-500',   bg: 'bg-slate-100'  },
];

export default function CreateIncident() {
  const { token } = useSelector((s) => s.auth);
  const navigate  = useNavigate();
  const fileRef   = useRef();

  const [form, setForm] = useState({ category: '', title: '', description: '', priority: '', location: '' });
  const [files,    setFiles]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [dragging, setDragging] = useState(false);

  const handleFileChange = (e) => setFiles((p) => [...p, ...Array.from(e.target.files)]);
  const handleDrop = (e) => { e.preventDefault(); setDragging(false); setFiles((p) => [...p, ...Array.from(e.dataTransfer.files)]); };
  const removeFile = (idx) => setFiles((p) => p.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category)           return setError('Please select a category');
    if (!form.title.trim())       return setError('Subject is required');
    if (!form.description.trim()) return setError('Description is required');
    if (!form.priority)           return setError('Please select a priority');
    setLoading(true); setError('');
    try {
      await axios.post(
        'https://it-helpdesk-ee86.onrender.com/api/incidents',
        { title: form.title, description: form.description, category: form.category, priority: form.priority, location: form.location },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/employee/incidents');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Raise New Incident</h2>
        <p className="text-sm text-slate-400 mt-0.5">Fill out the form below to submit a new IT support request</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2 mb-5">
          <AlertTriangle size={18}/> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* CATEGORY */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <label className="text-sm font-bold text-slate-800 block mb-4">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button key={cat.value} type="button" onClick={() => setForm({ ...form, category: cat.value })}
                  className={`flex flex-col items-start gap-3 p-5 rounded-xl border-2 text-left transition-all ${
                    form.category === cat.value ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${form.category === cat.value ? 'bg-blue-100' : cat.bg}`}>
                    <Icon size={22} className={form.category === cat.value ? 'text-blue-500' : cat.color}/>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{cat.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-tight">{cat.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SUBJECT + PRIORITY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <label className="text-sm font-bold text-slate-800 block mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input type="text" placeholder="Brief description of your issue..." value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
            <p className="text-xs text-slate-400 mt-1.5 text-right">{form.title.length}/120</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-800 block mb-2">
                Priority <span className="text-red-500">*</span>
              </label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 cursor-pointer text-slate-700 bg-white">
                <option value="">Select priority</option>
                <option value="low">🟢 Low — Minor issue, can wait</option>
                <option value="medium">🟡 Medium — Moderate impact</option>
                <option value="high">🟠 High — Significant impact</option>
                <option value="critical">🔴 Critical — Blocking work</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-800 block mb-2">Location / Floor</label>
              <input type="text" placeholder="e.g., Building A, Floor 3" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"/>
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <label className="text-sm font-bold text-slate-800 block mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea placeholder="Provide details about the issue. Include any error messages, steps to reproduce, and what you've already tried..."
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={5} maxLength={1000}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"/>
          <p className="text-xs text-slate-400 mt-1">{form.description.length}/1000 characters</p>
        </div>

        {/* ATTACHMENTS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <label className="text-sm font-bold text-slate-800 block mb-3">Attachments</label>
          <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
            onDrop={handleDrop} onClick={() => fileRef.current.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
              dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
            }`}>
            <Upload size={36} className="mb-2 text-slate-400"/>
            <p className="text-sm font-semibold text-slate-600">Click to upload or drag and drop</p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG, PDF up to 10MB</p>
            <input ref={fileRef} type="file" multiple accept=".png,.jpg,.jpeg,.pdf" onChange={handleFileChange} className="hidden"/>
          </div>
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Paperclip size={16}/>
                    <span className="text-sm text-slate-700 font-medium truncate max-w-[180px]">{f.name}</span>
                    <span className="text-xs text-slate-400">({(f.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button type="button" onClick={() => removeFile(idx)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <X size={16}/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TIPS */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-3">
          <Info className="text-blue-500 shrink-0" size={22}/>
          <div>
            <p className="text-sm font-bold text-blue-800 mb-3">Tips for faster resolution</p>
            <ul className="space-y-2">
              <li className="text-sm text-blue-700">• Include the exact error message</li>
              <li className="text-sm text-blue-700">• Mention steps before the issue occurred</li>
              <li className="text-sm text-blue-700">• Attach screenshots</li>
              <li className="text-sm text-blue-700">• Mention device and OS</li>
            </ul>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex gap-3 pb-10 pt-2">
          <button type="button" onClick={() => navigate('/employee/incidents')}
            className="px-8 py-3.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Submitting...</>
            ) : 'Submit Incident'}
          </button>
        </div>

      </form>
    </Layout>
  );
}