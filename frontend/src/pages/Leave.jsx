import React, { useState, useEffect } from 'react';
import { Plus, X, CheckCircle, XCircle } from 'lucide-react';
import API from '../utils/api.js';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const TYPES = ['annual','sick','maternity','emergency','other'];
const badge = s => { const m={pending:'badge-yellow',approved:'badge-green',rejected:'badge-red'}; return <span className={`badge ${m[s]}`}>{s}</span>; };

export default function Leave() {
  const { isHR } = useAuth();
  const [leaves, setLeaves]   = useState([]);
  const [modal, setModal]     = useState(false);
  const [tab, setTab]         = useState('my');
  const [form, setForm]       = useState({ leaveType:'annual', startDate:'', endDate:'', reason:'' });

  const load = async () => {
    const url = tab==='all'&&isHR() ? '/leave/all' : '/leave/my';
    const { data } = await API.get(url);
    setLeaves(data.leaves);
  };
  useEffect(() => { load(); }, [tab]);

  const apply = async (e) => {
    e.preventDefault();
    try {
      await API.post('/leave', form);
      toast.success('Leave applied!');
      setModal(false); setForm({leaveType:'annual',startDate:'',endDate:'',reason:''}); load();
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  const setStatus = async (id, status) => {
    try { await API.put(`/leave/${id}/status`, {status}); toast.success(`Leave ${status}`); load(); }
    catch { toast.error('Failed'); }
  };

  const cancel = async (id) => {
    if (!confirm('Cancel this request?')) return;
    try { await API.delete(`/leave/${id}`); toast.success('Cancelled'); load(); }
    catch (err) { toast.error(err.response?.data?.message||'Cannot cancel'); }
  };

  const cols = tab==='all'&&isHR()
    ? ['Employee','Type','Start','End','Days','Reason','Status','Actions']
    : ['Type','Start','End','Days','Reason','Status','Actions'];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
        <button onClick={()=>setModal(true)} className="btn-primary"><Plus size={16}/> Apply for Leave</button>
      </div>

      {isHR() && (
        <div className="flex gap-2 border-b border-gray-200">
          {['my','all'].map(t => (
            <button key={t} onClick={()=>setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab===t?'border-blue-600 text-blue-600':'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t==='my' ? 'My Leaves' : 'All Requests'}
            </button>
          ))}
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead><tr>{cols.map(h=><th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-100">
            {leaves.map(l=>(
              <tr key={l._id} className="hover:bg-gray-50">
                {tab==='all'&&isHR()&&<td className="td font-medium">{l.employee?.firstName} {l.employee?.lastName}</td>}
                <td className="td capitalize">{l.leaveType}</td>
                <td className="td">{new Date(l.startDate).toLocaleDateString()}</td>
                <td className="td">{new Date(l.endDate).toLocaleDateString()}</td>
                <td className="td">{l.totalDays}</td>
                <td className="td max-w-[180px] truncate">{l.reason}</td>
                <td className="td">{badge(l.status)}</td>
                <td className="td">
                  <div className="flex gap-1">
                    {isHR()&&l.status==='pending'&&(
                      <>
                        <button onClick={()=>setStatus(l._id,'approved')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Approve"><CheckCircle size={16}/></button>
                        <button onClick={()=>setStatus(l._id,'rejected')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Reject"><XCircle size={16}/></button>
                      </>
                    )}
                    {l.status==='pending'&&<button onClick={()=>cancel(l._id)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg" title="Cancel"><X size={16}/></button>}
                  </div>
                </td>
              </tr>
            ))}
            {leaves.length===0&&<tr><td colSpan={cols.length} className="td text-center py-10 text-gray-400">No leave records found</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-lg">Apply for Leave</h2>
              <button onClick={()=>setModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18}/></button>
            </div>
            <form onSubmit={apply} className="p-6 space-y-4">
              <div>
                <label className="label">Leave Type</label>
                <select className="input" value={form.leaveType} onChange={e=>setForm({...form,leaveType:e.target.value})}>
                  {TYPES.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Start Date</label><input className="input" type="date" required value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/></div>
                <div><label className="label">End Date</label><input className="input" type="date" required value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})}/></div>
              </div>
              <div><label className="label">Reason</label><textarea className="input" rows={3} required value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})}/></div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={()=>setModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Apply</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
