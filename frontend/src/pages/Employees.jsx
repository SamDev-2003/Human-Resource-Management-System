import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import API from '../utils/api.js';
import toast from 'react-hot-toast';

const EMPTY = { firstName:'', lastName:'', email:'', phone:'', gender:'Male', dateOfBirth:'', address:'', position:'', department:'', salary:'', joiningDate:'', status:'active' };

export default function Employees() {
  const [employees, setEmployees]   = useState([]);
  const [departments, setDepts]     = useState([]);
  const [search, setSearch]         = useState('');
  const [showModal, setModal]       = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [loading, setLoading]       = useState(true);

  const load = async () => {
    try {
      const { data } = await API.get(search ? `/employees?search=${search}` : '/employees');
      setEmployees(data.employees);
    } catch { toast.error('Failed to load employees'); }
    finally { setLoading(false); }
  };

  useEffect(() => { API.get('/departments').then(r => setDepts(r.data.departments)); load(); }, []);
  useEffect(() => { load(); }, [search]);

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (e) => { setEditing(e._id); setForm({ ...e, department: e.department?._id || '' }); setModal(true); };

  const submit = async (ev) => {
    ev.preventDefault();
    try {
      if (editing) {
        await API.put(`/employees/${editing}`, form);
        toast.success('Employee updated!');
      } else {
        const { data } = await API.post('/employees', form);
        toast.success(`Employee added! Temp password: ${data.tempPassword}`, { duration: 8000 });
      }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this employee?')) return;
    try { await API.delete(`/employees/${id}`); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Employee</button>
      </div>

      <div className="card">
        <div className="relative mb-5 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search by name, ID or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full">
            <thead><tr>
              {['Employee ID','Name','Position','Department','Email','Status','Actions'].map(h => <th key={h} className="th first:rounded-tl-xl last:rounded-tr-xl">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="td text-center py-10 text-gray-400">Loading…</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan="7" className="td text-center py-10 text-gray-400">No employees found</td></tr>
              ) : employees.map(e => (
                <tr key={e._id} className="hover:bg-gray-50 transition-colors">
                  <td className="td font-mono text-xs text-gray-500">{e.employeeId}</td>
                  <td className="td font-medium text-gray-900">{e.firstName} {e.lastName}</td>
                  <td className="td">{e.position}</td>
                  <td className="td">{e.department?.name || '—'}</td>
                  <td className="td text-gray-500">{e.email}</td>
                  <td className="td">
                    <span className={`badge ${e.status==='active'?'badge-green':e.status==='inactive'?'badge-yellow':'badge-red'}`}>{e.status}</span>
                  </td>
                  <td className="td">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><Edit2 size={14}/></button>
                      <button onClick={() => remove(e._id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-lg">{editing ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button onClick={() => setModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18}/></button>
            </div>
            <form onSubmit={submit} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[['First Name','firstName','text'],['Last Name','lastName','text'],['Email','email','email'],['Phone','phone','text'],['Position','position','text'],['Salary ($)','salary','number'],['Date of Birth','dateOfBirth','date'],['Joining Date','joiningDate','date']].map(([lbl, key, type]) => (
                <div key={key}>
                  <label className="label">{lbl}</label>
                  <input className="input" type={type} value={form[key]} required={['firstName','lastName','email','position','salary'].includes(key)}
                    onChange={e => setForm({...form,[key]:e.target.value})} />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="label">Address</label>
                <input className="input" value={form.address} onChange={e => setForm({...form,address:e.target.value})} />
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="input" value={form.gender} onChange={e => setForm({...form,gender:e.target.value})}>
                  {['Male','Female','Other'].map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Department</label>
                <select className="input" value={form.department} onChange={e => setForm({...form,department:e.target.value})} required>
                  <option value="">Select department…</option>
                  {departments.map(d=><option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={e => setForm({...form,status:e.target.value})}>
                  {['active','inactive','terminated'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'Update' : 'Add Employee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
