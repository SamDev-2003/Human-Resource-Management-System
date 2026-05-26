import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard, Users, Building2, Clock, CalendarOff,
  DollarSign, Star, FileBarChart, UserCircle, LogOut, Menu, X, ChevronRight
} from 'lucide-react';

const NAV = [
  { path: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard',   roles: ['admin','hr_manager','employee'] },
  { path: '/employees',   icon: Users,           label: 'Employees',   roles: ['admin','hr_manager'] },
  { path: '/departments', icon: Building2,        label: 'Departments', roles: ['admin','hr_manager'] },
  { path: '/attendance',  icon: Clock,            label: 'Attendance',  roles: ['admin','hr_manager','employee'] },
  { path: '/leave',       icon: CalendarOff,      label: 'Leave',       roles: ['admin','hr_manager','employee'] },
  { path: '/payroll',     icon: DollarSign,       label: 'Payroll',     roles: ['admin','hr_manager','employee'] },
  { path: '/performance', icon: Star,             label: 'Performance', roles: ['admin','hr_manager','employee'] },
  { path: '/reports',     icon: FileBarChart,     label: 'Reports',     roles: ['admin','hr_manager'] },
  { path: '/profile',     icon: UserCircle,       label: 'My Profile',  roles: ['admin','hr_manager','employee'] },
];

const roleLabel = { admin: 'Administrator', hr_manager: 'HR Manager', employee: 'Employee' };
const roleBadgeColor = { admin: 'bg-purple-500', hr_manager: 'bg-blue-500', employee: 'bg-emerald-500' };

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const links = NAV.filter(n => n.roles.includes(user?.role));

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">ST</div>
        <div>
          <p className="font-bold text-sm leading-tight">SmartTech Ltd</p>
          <p className="text-slate-400 text-xs">HRMS Portal</p>
        </div>
        <button onClick={() => setOpen(false)} className="ml-auto lg:hidden text-slate-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {links.map(({ path, icon: Icon, label }) => (
          <NavLink key={path} to={path} onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
               ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
            }
          >
            <Icon size={17} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={13} className="opacity-0 group-hover:opacity-100" />
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-slate-700 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded-md ${roleBadgeColor[user?.role]} bg-opacity-20 text-slate-300`}>
              {roleLabel[user?.role]}
            </span>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors w-full">
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-60 shrink-0">
        <div className="w-full"><Sidebar /></div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative w-60 h-full"><Sidebar /></div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 bg-white border-b border-gray-200 px-4 py-3 shrink-0">
          <button onClick={() => setOpen(true)} className="text-gray-600"><Menu size={22} /></button>
          <span className="font-semibold text-gray-800">SmartTech HRMS</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
