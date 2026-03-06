import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Layout from '../../components/Layout';
import {
  User,
  Users,
  Wrench,
  Shield,
  Mail,
  Building,
  Target,
  Search,
  Trash2,
  X,
  Save
} from "lucide-react";

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

const ROLE_STYLES = {
  employee: { bg: 'bg-blue-50', text: 'text-blue-600', icon: <User size={14}/> , label: 'Employee' },
  engineer: { bg: 'bg-purple-50', text: 'text-purple-600', icon: <Wrench size={14}/> , label: 'IT Engineer' },
  admin: { bg: 'bg-red-50', text: 'text-red-600', icon: <Shield size={14}/> , label: 'Admin' },
};

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-600',
  'bg-emerald-100 text-emerald-600',
  'bg-amber-100 text-amber-600',
  'bg-pink-100 text-pink-600',
  'bg-cyan-100 text-cyan-600',
  'bg-violet-100 text-violet-600',
];

const ALL_SKILLS = ['Hardware', 'Software', 'Network', 'Access', 'Storage', 'Other'];

export default function ManageUsers() {
  const { token } = useSelector((s) => s.auth);

  const [users,setUsers] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [search,setSearch] = useState('');
  const [roleFilter,setRoleFilter] = useState('all');
  const [menuOpen,setMenuOpen] = useState(null);
  const [showAdd,setShowAdd] = useState(false);
  const [showDelete,setShowDelete] = useState(null);
  const [showSkills,setShowSkills] = useState(null);
  const [formLoading,setFormLoading] = useState(false);
  const [formError,setFormError] = useState('');
  const [form,setForm] = useState({ name:'', email:'', password:'', role:'employee' });

  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://it-helpdesk-ee86.onrender.com/api/users',{
        headers:{ Authorization:`Bearer ${token}` }
      });

      const data = Array.isArray(res.data) ? res.data : res.data.users || res.data.data || [];
      setUsers(data);
    } catch(err){
      setError(err.response?.data?.message || err.message);
    } finally{
      setLoading(false);
    }
  };

  useEffect(()=>{ fetchUsers(); },[token]);

  useEffect(()=>{
    const handler = () => setMenuOpen(null);
    document.addEventListener('click',handler);
    return () => document.removeEventListener('click',handler);
  },[]);

  const filtered = users.filter((u)=>{
    const matchSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter === 'all' || u.role === roleFilter;

    return matchSearch && matchRole;
  });

  const counts = {
    total: users.length,
    employee: users.filter(u=>u.role==='employee').length,
    engineer: users.filter(u=>u.role==='engineer').length,
    admin: users.filter(u=>u.role==='admin').length
  };

  const handleAddUser = async (e)=>{
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try{
      await axios.post('https://it-helpdesk-ee86.onrender.com/api/users',form,{
        headers:{ Authorization:`Bearer ${token}` }
      });

      setShowAdd(false);
      setForm({ name:'', email:'', password:'', role:'employee' });
      fetchUsers();
    }catch(err){
      setFormError(err.response?.data?.message || err.message);
    }finally{
      setFormLoading(false);
    }
  };

  const handleDelete = async(id)=>{
    try{
      await axios.delete(`https://it-helpdesk-ee86.onrender.com/api/users/${id}`,{
        headers:{ Authorization:`Bearer ${token}` }
      });

      setShowDelete(null);
      fetchUsers();
    }catch(err){
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleRoleChange = async(id,newRole)=>{
    try{
      await axios.put(`https://it-helpdesk-ee86.onrender.com/api/users/${id}`,{ role:newRole },{
        headers:{ Authorization:`Bearer ${token}` }
      });

      setMenuOpen(null);
      fetchUsers();
    }catch(err){
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleSkillsSave = async(userId,skills)=>{
    try{
      await axios.put(`https://it-helpdesk-ee86.onrender.com/api/users/${userId}`,{ skills },{
        headers:{ Authorization:`Bearer ${token}` }
      });

      setShowSkills(null);
      fetchUsers();
    }catch(err){
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <Layout>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage employees, engineers, and administrators
          </p>
        </div>

        <button
          onClick={()=>setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <User size={16}/> Add User
        </button>
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap gap-3 mb-5">
        {[
          {label:'Total',value:counts.total,filter:'all',icon:<Users size={16}/>},
          {label:'Employees',value:counts.employee,filter:'employee',icon:<User size={16}/>},
          {label:'Engineers',value:counts.engineer,filter:'engineer',icon:<Wrench size={16}/>},
          {label:'Admins',value:counts.admin,filter:'admin',icon:<Shield size={16}/>}
        ].map((s)=>(
          <button
            key={s.filter}
            onClick={()=>setRoleFilter(s.filter)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
              roleFilter===s.filter
                ? 'bg-indigo-500 text-white border-indigo-500'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {s.icon}
            {s.label}: <span className="font-bold">{s.value}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={16}/>
        </span>

        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
        />
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-4 text-sm">
          {error}
        </div>
      ) : filtered.length===0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-2xl border border-slate-200">
          <Users size={40} className="mb-3"/>
          <p className="text-slate-600 font-semibold">No users found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {filtered.map((u,idx)=>{
            const roleStyle = ROLE_STYLES[u.role] || ROLE_STYLES.employee;
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];

            return (
              <div key={u._id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all">

                <div className="flex items-start justify-between mb-4">

                  <div className="flex items-center gap-3">

                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${avatarColor}`}>
                      {getInitials(u.name)}
                    </div>

                    <div>
                      <p className="text-base font-bold text-slate-900">{u.name}</p>

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleStyle.bg} ${roleStyle.text}`}>
                          {roleStyle.icon} {roleStyle.label}
                        </span>

                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                          Active
                        </span>
                      </div>
                    </div>

                  </div>

                </div>

                <div className="space-y-1.5 text-sm text-slate-500">

                  <div className="flex items-center gap-2">
                    <Mail size={14}/>
                    <span className="truncate">{u.email}</span>
                  </div>

                  {u.department && (
                    <div className="flex items-center gap-2">
                      <Building size={14}/>
                      <span>{u.department}</span>
                    </div>
                  )}

                  {u.role==='engineer' && (
                    <div className="flex items-start gap-2 mt-2">
                      <Target size={14}/>
                      <div className="flex flex-wrap gap-1">
                        {u.skills && u.skills.length>0 ? (
                          u.skills.map((s)=>(
                            <span key={s} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            No skills set — generalist
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                  <span>
                    Joined: {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>

              </div>
            )
          })}

        </div>
      )}

    </Layout>
  );
}
