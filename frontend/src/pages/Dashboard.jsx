import React, { useEffect, useState } from 'react';
import { Users, Building2, CalendarOff, Clock, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import API from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isHR } = useAuth();
  const [stats, setStats]           = useState(null);
  const [deptStats, setDeptStats]   = useState([]);
  const [recentLeaves, setRecent]   = useState([]);
  const [todayAtt, setTodayAtt]     = useState(null);
  const [myLeaves, setMyLeaves]     = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (isHR()) {
      API.get('/dashboard/stats').then(r => {
        setStats(r.data.stats);
        setDeptStats(r.data.deptStats);
        setRecent(r.data.recentLeaves);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      Promise.all([
        API.get('/attendance/today-status'),
        API.get('/leave/my'),
      ]).then(([att, lv]) => {
        setTodayAtt(att.data.attendance);
        setMyLeaves(lv.data.leaves.slice(0, 4));
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Welcome back, <span className="font-medium text-gray-700">{user?.name}</span></p>
      </div>

      {/* ── HR / Admin view ───────────────────────────── */}
      {isHR() && stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <StatCard icon={Users}       label="Total Employees"  value={stats.totalEmployees}   color="bg-blue-600"    sub="Active only" />
            <StatCard icon={Building2}   label="Departments"      value={stats.totalDepartments} color="bg-violet-600"  />
            <StatCard icon={CalendarOff} label="Pending Leaves"   value={stats.pendingLeaves}    color="bg-amber-500"   sub="Needs review" />
            <StatCard icon={Clock}       label="Present Today"    value={stats.todayPresent}     color="bg-emerald-600" />
            <StatCard icon={DollarSign}  label="Monthly Payroll"  value={`$${(stats.monthlyPayroll||0).toLocaleString()}`} color="bg-rose-500" sub="This month" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {deptStats.length > 0 && (
              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-4">Employees by Department</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={deptStats} barSize={28}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6,6,0,0]}>
                      {deptStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent leaves */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Recent Leave Requests</h2>
                <Link to="/leave" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              <div className="space-y-3">
                {recentLeaves.length === 0 && <p className="text-sm text-gray-400">No requests yet</p>}
                {recentLeaves.map(l => (
                  <div key={l._id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{l.employee?.firstName} {l.employee?.lastName}</p>
                      <p className="text-xs text-gray-400 capitalize">{l.leaveType} · {new Date(l.startDate).toLocaleDateString()}</p>
                    </div>
                    <span className={`badge ${l.status==='approved'?'badge-green':l.status==='rejected'?'badge-red':'badge-yellow'}`}>
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Employee view ───────────────────────────── */}
      {!isHR() && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's attendance */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Clock size={18} className="text-blue-600"/>Today's Attendance</h2>
            {todayAtt ? (
              <div className="space-y-3">
                <Row label="Status">
                  <span className={`badge ${todayAtt.status==='present'?'badge-green':todayAtt.status==='late'?'badge-yellow':'badge-red'}`}>{todayAtt.status}</span>
                </Row>
                <Row label="Check In">{todayAtt.checkIn ? new Date(todayAtt.checkIn).toLocaleTimeString() : '—'}</Row>
                <Row label="Check Out">{todayAtt.checkOut ? new Date(todayAtt.checkOut).toLocaleTimeString() : '—'}</Row>
                <Row label="Work Hours">{todayAtt.workHours ? `${todayAtt.workHours} hrs` : '—'}</Row>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <Clock size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No record yet</p>
                <Link to="/attendance" className="text-xs text-blue-600 mt-1 inline-block hover:underline">Go to Attendance →</Link>
              </div>
            )}
          </div>

          {/* My leaves */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2"><CalendarOff size={18} className="text-blue-600"/>My Leave Requests</h2>
              <Link to="/leave" className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>
            {myLeaves.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No leave requests yet</p>
            ) : (
              <div className="space-y-2">
                {myLeaves.map(l => (
                  <div key={l._id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium capitalize">{l.leaveType}</p>
                      <p className="text-xs text-gray-400">{new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}</p>
                    </div>
                    <span className={`badge ${l.status==='approved'?'badge-green':l.status==='rejected'?'badge-red':'badge-yellow'}`}>{l.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="card md:col-span-2">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-blue-600"/>Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { to: '/attendance', label: 'Check In/Out', icon: Clock,       color: 'text-blue-600 bg-blue-50' },
                { to: '/leave',      label: 'Apply Leave',  icon: CalendarOff, color: 'text-amber-600 bg-amber-50' },
                { to: '/payroll',    label: 'My Payslip',   icon: DollarSign,  color: 'text-emerald-600 bg-emerald-50' },
                { to: '/performance',label: 'Performance',  icon: TrendingUp,  color: 'text-violet-600 bg-violet-50' },
              ].map(({ to, label, icon: Icon, color }) => (
                <Link key={to} to={to} className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${color} hover:opacity-80 transition-opacity`}>
                  <Icon size={24} />
                  <span className="text-xs font-medium text-center">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{children}</span>
    </div>
  );
}
