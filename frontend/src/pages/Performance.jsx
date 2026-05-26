import React, { useState, useEffect } from 'react';
import { Plus, X, Star } from 'lucide-react';
import API from '../utils/api.js';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const Stars = ({ v }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i=><Star key={i} size={13} className={i<=v?'text-amber-400 fill-amber-400':'text-gray-200 fill-gray-200'}/>)}
  </div>
);

const initCats = { productivity:3, teamwork:3, communication:3, punctuality:3, quality:3 };

export default function Performance() {
  const { isHR } = useAuth();
  const [evals, setEvals]       = useState([]);
  const [employees, setEmps]    = useState([]);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState({ employee:'', period:'', rating:3, comments:'', goals:'', categories:{...initCats} });

  const load = async () => {
    const url = isHR() ? '/performance/all' : '/performance/my';
    const { data } = await API.get(url);
    setEvals(data.evaluations);
  };
  useEffect(() => {
    load();
    if (isHR()) API.get('/employees').then(r=>setEmps(r.data.employees));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try { await API.post('/performance', form); toast.success('Evaluation saved!'); setModal(false); load(); }
    catch (err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
        {isHR()&&<button onClick={()=>{setForm({employee:'',period:'',rating:3,comments:'',goals:'',categories:{...initCats}});setModal(true)}} className="btn-primary"><Plus size={16}/> Add Evaluation</button>}
      </div>

      <div className="space-y-4">
        {evals.length===0&&<div className="card text-center py-16 text-gray-400"><Star size={40} className="mx-auto mb-2 opacity-20"/>No evaluations found</div>}
        {evals.map(ev=>(
          <div key={ev._id} className="card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                {isHR()&&<h3 className="font-semibold text-gray-900">{ev.employee?.firstName} {ev.employee?.lastName} <span className="text-gray-400 font-normal text-sm">({ev.employee?.employeeId})</span></h3>}
                <p className="text-sm text-gray-500 mt-0.5">{ev.period} · Evaluated by {ev.evaluatedBy?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Stars v={ev.rating}/>
                <span className="text-sm font-bold text-gray-700">{ev.rating}/5</span>
              </div>
            </div>
            {ev.categories&&(
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 border-t pt-4">
                {Object.entries(ev.categories).map(([k,v])=>(
                  <div key={k} className="text-center">
                    <p className="text-xs text-gray-400 capitalize mb-1">{k}</p>
                    <Stars v={v}/>
                  </div>
                ))}
              </div>
            )}
            {ev.comments&&<p className="mt-3 text-sm text-gray-600 border-t pt-3">{ev.comments}</p>}
            {ev.goals&&<p className="mt-2 text-sm text-blue-600">🎯 {ev.goals}</p>}
          </div>
        ))}
      </div>

      {modal&&(
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-lg">Add Evaluation</h2>
              <button onClick={()=>setModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18}/></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div><label className="label">Employee</label>
                <select className="input" required value={form.employee} onChange={e=>setForm({...form,employee:e.target.value})}>
                  <option value="">Select…</option>
                  {employees.map(e=><option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </div>
              <div><label className="label">Period (e.g. Q2 2025)</label><input className="input" required value={form.period} onChange={e=>setForm({...form,period:e.target.value})}/></div>
              <div><label className="label">Overall Rating (1–5)</label><input className="input" type="number" min="1" max="5" required value={form.rating} onChange={e=>setForm({...form,rating:parseInt(e.target.value)})}/></div>
              <div>
                <label className="label">Category Ratings (1–5)</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {Object.keys(form.categories).map(k=>(
                    <div key={k}><label className="text-xs text-gray-500 capitalize">{k}</label>
                      <input className="input" type="number" min="1" max="5" value={form.categories[k]}
                        onChange={e=>setForm({...form,categories:{...form.categories,[k]:parseInt(e.target.value)}})}/>
                    </div>
                  ))}
                </div>
              </div>
              <div><label className="label">Comments</label><textarea className="input" rows={3} value={form.comments} onChange={e=>setForm({...form,comments:e.target.value})}/></div>
              <div><label className="label">Goals for Next Period</label><textarea className="input" rows={2} value={form.goals} onChange={e=>setForm({...form,goals:e.target.value})}/></div>
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={()=>setModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
