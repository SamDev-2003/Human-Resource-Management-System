import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, Clock } from 'lucide-react';
import API from '../utils/api.js';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const statusBadge = s => {
  const m = { present:'badge-green', late:'badge-yellow', absent:'badge-red', 'half-day':'badge-blue', 'on-leave':'badge-gray' };
  return <span className={`badge ${m[s]||'badge-gray'}`}>{s}</span>;
};

export default function Attendance() {
  const { isHR } = useAuth();
  const [today, setToday]     = useState(null);
  const [my, setMy]           = useState([]);
  const [all, setAll]         = useState([]);
  const [month, setMonth]     = useState(new Date().getMonth()+1);
  const [year]                = useState(new Date().getFullYear());
  const [busy, setBusy]       = useState(false);

  const loadToday = () => API.get('/attendance/today-status').then(r=>setToday(r.data.attendance));
  const loadMy    = () => API.get(`/attendance/my?month=${month}&year=${year}`).then(r=>setMy(r.data.records));
  const loadAll   = () => isHR() && API.get('/attendance/all').then(r=>setAll(r.data.records));

  useEffect(() => { loadToday(); loadMy(); loadAll(); }, [month]);

  const doCheckIn = async () => {
    setBusy(true);
    try { await API.post('/attendance/checkin'); toast.success('Checked in!'); loadToday(); }
    catch (e) { toast.error(e.response?.data?.message||'Failed'); }
    finally { setBusy(false); }
  };
  const doCheckOut = async () => {
    setBusy(true);
    try { await API.post('/attendance/checkout'); toast.success('Checked out!'); loadToday(); }
    catch (e) { toast.error(e.response?.data?.message||'Failed'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>

      {/* Check-in card */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900">{new Date().toDateString()}</p>
            <p className="text-sm text-gray-400 mt-0.5">
              {today ? `Status: ${today.status}` : 'Not checked in yet'}
            </p>
          </div>
          <div className="flex items-center gap-6">
            {today?.checkIn && (
              <div className="text-center">
                <p className="text-xs text-gray-400">In</p>
                <p className="font-mono font-bold">{new Date(today.checkIn).toLocaleTimeString()}</p>
              </div>
            )}
            {today?.checkOut && (
              <div className="text-center">
                <p className="text-xs text-gray-400">Out</p>
                <p className="font-mono font-bold">{new Date(today.checkOut).toLocaleTimeString()}</p>
              </div>
            )}
            {today?.workHours > 0 && (
              <div className="text-center">
                <p className="text-xs text-gray-400">Hours</p>
                <p className="font-mono font-bold">{today.workHours}h</p>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={doCheckIn} disabled={busy||!!today?.checkIn} className="btn-success">
                <LogIn size={16}/> Check In
              </button>
              <button onClick={doCheckOut} disabled={busy||!today?.checkIn||!!today?.checkOut} className="btn-danger">
                <LogOut size={16}/> Check Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* My history */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold text-gray-900">My History</h2>
          <select className="input w-44 text-sm" value={month} onChange={e=>setMonth(e.target.value)}>
            {MONTHS.map((m,i)=><option key={i} value={i+1}>{m} {year}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full">
            <thead><tr>{['Date','Check In','Check Out','Hours','Status'].map(h=><th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {my.map(r=>(
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="td">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="td font-mono text-xs">{r.checkIn?new Date(r.checkIn).toLocaleTimeString():'—'}</td>
                  <td className="td font-mono text-xs">{r.checkOut?new Date(r.checkOut).toLocaleTimeString():'—'}</td>
                  <td className="td">{r.workHours||'—'}</td>
                  <td className="td">{statusBadge(r.status)}</td>
                </tr>
              ))}
              {my.length===0&&<tr><td colSpan="5" className="td text-center py-8 text-gray-400">No records this month</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* HR: all employees today */}
      {isHR() && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">All Employee Attendance (Today)</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full">
              <thead><tr>{['Employee','ID','Department','Check In','Check Out','Status'].map(h=><th key={h} className="th">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-100">
                {all.map(r=>(
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="td font-medium">{r.employee?.firstName} {r.employee?.lastName}</td>
                    <td className="td font-mono text-xs text-gray-500">{r.employee?.employeeId}</td>
                    <td className="td">{r.employee?.department?.name||'—'}</td>
                    <td className="td font-mono text-xs">{r.checkIn?new Date(r.checkIn).toLocaleTimeString():'—'}</td>
                    <td className="td font-mono text-xs">{r.checkOut?new Date(r.checkOut).toLocaleTimeString():'—'}</td>
                    <td className="td">{statusBadge(r.status)}</td>
                  </tr>
                ))}
                {all.length===0&&<tr><td colSpan="6" className="td text-center py-8 text-gray-400">No records today</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
