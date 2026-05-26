import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Building2, Users } from 'lucide-react';
import API from '../utils/api.js';
import toast from 'react-hot-toast';

export default function Departments() {
  const [depts, setDepts]   = useState([]);
  const [modal, setModal]   = useState(false);
  const [editing, setEdit]  = useState(null);
  const [form, setForm]     = useState({ name:'', description:'' });

  const load = async () => {
    const { data } = await API.get('/departments');
    setDepts(data.departments);
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEdit(null); setForm({name:'',description:''}); setModal(true); };
  const openEdit = d  => { setEdit(d._id); setForm({name:d.name, description:d.description||''}); setModal(true); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      editing ? await API.put(`/departments/${editing}`, form) : await API.post('/departments', form);
      toast.success(editing ? 'Department updated' : 'Department created');
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this department?')) return;
    try { await API.delete(`/departments/${id}`); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Cannot delete'); }
  };

  const colors = ['bg-blue-500','bg-violet-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-cyan-500'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
        <button onClick={openAdd} className="btn-primary"><Plus size={16}/> Add Department</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {depts.map((d, i) => (
          <div key={d._id} className="card group hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 ${colors[i%colors.length]} rounded-2xl flex items-center justify-center shrink-0`}>
                  <Building2 size={20} className="text-white"/>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{d.name}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Users size={11}/> {d.employeeCount} employees
                  </p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><Edit2 size={14}/></button>
                <button onClick={() => remove(d._id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={14}/></button>
              </div>
            </div>
            {d.description && <p className="text-sm text-gray-500 mt-3 border-t pt-3">{d.description}</p>}
          </div>
        ))}
        {depts.length === 0 && (
          <div className="col-span-3 card text-center py-12 text-gray-400">
            <Building2 size={40} className="mx-auto mb-2 opacity-20"/>
            No departments yet. Add one to get started.
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-lg">{editing ? 'Edit' : 'Add'} Department</h2>
              <button onClick={() => setModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18}/></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div><label className="label">Name</label><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
              <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={()=>setModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editing?'Update':'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
