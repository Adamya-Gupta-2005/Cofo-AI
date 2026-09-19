import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Layers,
  LayoutDashboard,
  History,
  LogOut,
  ShieldCheck,
  Zap,
  Cpu,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore.js';
import { authApi } from '../../api/auth.api.js';
import toast from 'react-hot-toast';

export const Sidebar = () => {
  const { user, clearUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      clearUser();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      clearUser();
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Studio Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transformation History', path: '/history', icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950/40">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-white tracking-tight text-sm flex items-center gap-1.5">
            ContentForge <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">AI</span>
          </div>
          <div className="text-[11px] text-slate-400">Deterministic Engine</div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Workspace
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-input text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Platform Badges */}
      <div className="mx-4 mb-4 p-3 rounded-card bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <ShieldCheck className="w-4 h-4 text-green-400" />
          <span>Sacred Fact Preservation</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Groq LLaMA 3.1 70B</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Zero-distortion single model transformation with deterministic checks.
        </p>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-semibold text-xs text-slate-200 shrink-0 uppercase">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Operator'}</div>
            <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-input transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
