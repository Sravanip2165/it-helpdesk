import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import ChatBot from './ChatBot';
import socket from '../api/socketClient';

// Lucide React Icon Imports
import {
  LayoutDashboard,
  Ticket,
  Users,
  Monitor,
  FileText,
  Settings,
  Home,
  Bug,
  Activity,
  BookOpen,
  List,
  PlusCircle,
  Headphones,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Menu,
  Search,
  Bell,
  ChevronDown,
  User as UserIcon
} from 'lucide-react';

const navItems = {
  admin: [
    { label: 'Dashboard',     icon: <LayoutDashboard size={18} />, path: '/admin/dashboard' },
    { label: 'All Incidents', icon: <Ticket size={18} />, path: '/admin/incidents' },
    { label: 'Users',         icon: <Users size={18} />, path: '/admin/users' },
    { label: 'Assets',        icon: <Monitor size={18} />, path: '/admin/assets' },
    { label: 'Reports',       icon: <FileText size={18} />, path: '/admin/reports' },
    { label: 'Settings',      icon: <Settings size={18} />, path: '/admin/dashboard' },
  ],
  engineer: [
    { label: 'Dashboard',        icon: <Home size={18} />, path: '/engineer/dashboard' },
    { label: 'Assigned Tickets', icon: <Bug size={18} />, path: '/engineer/incidents' },
    { label: 'SLA Monitor',      icon: <Activity size={18} />, path: '/engineer/sla' },
    { label: 'Knowledge Base',   icon: <BookOpen size={18} />, path: '/engineer/knowledge' },
  ],
  employee: [
    { label: 'Dashboard',       icon: <LayoutDashboard size={18} />, path: '/employee/dashboard' },
    { label: 'My Incidents',    icon: <List size={18} />, path: '/employee/incidents' },
    { label: 'Create Incident', icon: <PlusCircle size={18} />, path: '/employee/incidents/new' },
  ],
};

const roleLabels = { admin: 'Administrator', engineer: 'IT Engineer', employee: 'Employee' };

export default function Layout({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const { user, role } = useSelector((state) => state.auth);

  const [collapsed,     setCollapsed]     = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [notifications, setNotifications] = useState([]);

  const searchRef = useRef(null);
  const notifRef  = useRef(null);
  const dropRef   = useRef(null);

  useEffect(() => {
    if (!user?._id) return;
    socket.emit('join_user', user._id);
    socket.on('notification', (data) => {
      setNotifications((prev) => [
        {
          id:    Date.now(),
          title: data.type === 'new_incident'  ? 'New Ticket Assigned'
               : data.type === 'status_change' ? 'Ticket Status Updated'
               : data.type === 'new_comment'   ? 'New Comment'
               : 'Notification',
          desc:  data.message,
          time:  'just now',
          read:  false,
        },
        ...prev.slice(0, 19),
      ]);
    });
    return () => { socket.off('notification'); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current  && !notifRef.current.contains(e.target))  setNotifOpen(false);
      if (dropRef.current   && !dropRef.current.contains(e.target))   setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) { setSearchOpen(false); setSearchQuery(''); }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.querySelector('input')?.focus(), 50);
  }, [searchOpen]);

  const handleLogout  = () => { dispatch(logout()); navigate('/login'); };
  const handleProfile = () => { setDropdownOpen(false); navigate('/' + role + '/profile'); };
  const markAllRead   = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markOneRead   = (id) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  const items       = navItems[role] || [];
  const initials    = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const allPages    = items.map((i) => ({ label: i.label, path: i.path, icon: i.icon }));
  const searchResults = searchQuery.trim()
    ? allPages.filter((p) => p.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={[
        'fixed top-0 left-0 h-full z-30 flex flex-col bg-[#0f1117] transition-all duration-300 ease-in-out',
        collapsed ? 'w-[72px]' : 'w-[260px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ].join(' ')}>

        <div className={['flex items-center h-16 border-b border-white/[0.08] shrink-0', collapsed ? 'justify-center px-0' : 'px-5 gap-3'].join(' ')}>
          <div className="w-9 h-9 rounded-[10px] bg-indigo-500 flex items-center justify-center shrink-0">
            <span className="text-white flex items-center justify-center"><Headphones size={20} /></span>
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-slate-200 leading-tight">HelpDesk Pro</p>
              <p className="text-[11px] text-white/40">IT Support System</p>
            </div>
          )}
        </div>

        <div className={['flex items-center border-b border-white/[0.08] py-3 shrink-0', collapsed ? 'justify-center px-0' : 'px-5 gap-3'].join(' ')}>
          <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
            <span className="text-indigo-400 text-xs font-bold">{initials}</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-[11px] text-white/40">{roleLabels[role]}</p>
            </div>
          )}
        </div>

        {!collapsed && (
          <p className="px-5 pt-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/30">Navigation</p>
        )}

        <nav className="flex-1 px-2 py-2 overflow-y-auto space-y-1">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button key={item.label} onClick={() => navigate(item.path)} title={collapsed ? item.label : ''}
                className={[
                  'w-full flex items-center gap-3 rounded-lg py-2.5 transition-all duration-150',
                  collapsed ? 'justify-center px-0' : 'px-3',
                  isActive && item.label === 'Dashboard' ? 'bg-indigo-500 text-white' : isActive ? 'text-white' : 'text-white/60 hover:bg-white/[0.06] hover:text-white/90',
                ].join(' ')}>
                <span className="shrink-0 flex items-center justify-center text-white/50">{item.icon}</span>
                {!collapsed && <span className={isActive ? 'text-sm font-semibold' : 'text-sm font-normal'}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="px-2 py-3 border-t border-white/[0.08] shrink-0">
          <button onClick={handleLogout} title={collapsed ? 'Logout' : ''}
            className={['w-full flex items-center gap-3 rounded-lg py-2.5 text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150', collapsed ? 'justify-center px-0' : 'px-3'].join(' ')}>
            <span className="shrink-0 flex items-center justify-center"><LogOut size={18} /></span>
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>

        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-800 border border-white/10 text-white/50 hover:bg-slate-700 flex items-center justify-center z-50 transition-colors">
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      <div className={['flex flex-col flex-1 transition-all duration-300', collapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'].join(' ')}>
        <header className="h-20 bg-white border-b border-slate-200 flex items-center px-8 gap-4 shrink-0 sticky top-0 z-10">
          <button className="md:hidden text-slate-600 hover:text-slate-900" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu size={20} />
          </button>

          <div className="flex-1">
            <h1 className="text-base font-bold text-slate-900">
              {items.find((i) => i.path === location.pathname)?.label || 'Dashboard'}
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block"></p>
          </div>

          {/* Search */}
          <div className="relative" ref={searchRef}>
            <button onClick={() => { setSearchOpen(!searchOpen); setNotifOpen(false); setDropdownOpen(false); }}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-500 hover:text-slate-800">
              <Search size={18} />
            </button>
            {searchOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-100">
                  <input type="text" placeholder="Search pages..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 transition-all" />
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {searchQuery === '' ? (
                    <div className="py-4 px-4">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick Links</p>
                      {allPages.map((page) => (
                        <button key={page.path} onClick={() => { navigate(page.path); setSearchOpen(false); setSearchQuery(''); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 text-left transition-colors">
                          <span className="flex items-center text-slate-500">{page.icon}</span>
                          <span className="text-sm font-medium text-slate-700">{page.label}</span>
                        </button>
                      ))}
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="p-2">
                      {searchResults.map((page) => (
                        <button key={page.path} onClick={() => { navigate(page.path); setSearchOpen(false); setSearchQuery(''); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 text-left transition-colors">
                          <span className="flex items-center text-slate-500">{page.icon}</span>
                          <span className="text-sm font-medium text-slate-700">{page.label}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center flex flex-col items-center">
                      <div className="text-slate-300 mb-2"><Search size={32} /></div>
                      <p className="text-sm text-slate-400">No results for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => { setNotifOpen(!notifOpen); setSearchOpen(false); setDropdownOpen(false); }}
              className="relative w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-500 hover:text-slate-800">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                    <p className="text-xs text-slate-400">{unreadCount} unread</p>
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center flex flex-col items-center">
                      <div className="text-slate-300 mb-2"><Bell size={32} /></div>
                      <p className="text-sm text-slate-400">No notifications yet</p>
                    </div>
                  ) : notifications.map((notif) => (
                    <div key={notif.id} onClick={() => markOneRead(notif.id)}
                      className={['flex items-start gap-3 px-5 py-4 cursor-pointer border-b border-slate-50 hover:bg-slate-50 transition-colors', !notif.read ? 'bg-indigo-50/50' : ''].join(' ')}>
                      <div className={['w-2 h-2 rounded-full mt-2 shrink-0', !notif.read ? 'bg-indigo-500' : 'bg-slate-200'].join(' ')} />
                      <div className="flex-1 min-w-0">
                        <p className={['text-sm', !notif.read ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'].join(' ')}>{notif.title}</p>
                        <p className="text-xs text-slate-400 truncate">{notif.desc}</p>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0 whitespace-nowrap">{notif.time}</span>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-slate-100 text-center">
                  <button className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors">
                    View all notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <div className="relative" ref={dropRef}>
            <button onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); setSearchOpen(false); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-600">{initials}</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{roleLabels[role]}</p>
              </div>
              <span className="text-slate-400 flex items-center"><ChevronDown size={14} /></span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <button onClick={handleProfile}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <span className="flex items-center text-slate-500"><UserIcon size={16} /></span> My Profile
                </button>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-slate-100">
                  <span className="flex items-center text-red-400"><LogOut size={16} /></span> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-slate-50">
          {children}
        </main>
      </div>

      {role === 'employee' && <ChatBot />}

    </div>
  );
}