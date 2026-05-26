import React, { useState, useEffect } from 'react';
import { Plus, X, CheckCircle } from 'lucide-react';
import API from '../utils/api.js';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Payroll() {
  const { isHR } = useAuth();
  const [payrolls, setPayrolls]     = useState([]);
  const [employees, setEmployees]   = useState([]);
  const [modal, setModal]           = useState(false);
  const [filterMonth, setFM]        = useState(new Date().getMonth()+1);
  const [filterYear]                = useState(new Date().getFullYear());
  const [form, setForm]             = useState({
    employeeId:'', month:new Date().getMonth()+1, year:new Date().getFullYear(),
    allowances:0, overtime:0, bonus:0, taxDeduction:0, otherDeductions:0
  });

  const load = async () => {
    const url = isHR() ? `/payroll/all?month=${filterMonth}&year=${filterYear}` : '/payroll/my';
    const { data } = await API.get(url);
    setPayrolls(data.payrolls);
  };
  useEffect(() => {
    load();
    if (isHR()) API.get('/employees').then(r=>setEmployees(r.data.employees));
  }, [filterMonth]);

  const generate = async (e) => {
    e.preventDefault();
    try { await API.post('/payroll/generate', form); toast.success('Payroll generated!'); setModal(false); load(); }
    catch (err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  const markPaid = async (id) => {
    try { await API.put(`/payroll/${id}/pay`); toast.success('Marked as paid!'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
        {isHR() && <button onClick={()=>setModal(true)} className="btn-primary"><Plus size={16}/> Generate Payroll</button>}
      </div>

      {isHR() && (
        <select className="input w-48" value={filterMonth} onChange={e=>setFM(e.target.value)}>
          {MONTHS.map((m,i)=><option key={i} value={i+1}>{m} {filterYear}</option>)}
        </select>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead><tr>
            {(isHR()?['Employee','Period','Basic','Allowances','Bonus','Deductions','Net','Status','']:['Period','Basic','Net','Status']).map((h,i)=><th key={i} className="th">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {payrolls.map(p=>(
              <tr key={p._id} className="hover:bg-gray-50">
                {isHR()&&<td className="td font-medium">{p.employee?.firstName} {p.employee?.lastName}</td>}
                <td className="td">{MONTHS[p.month-1]} {p.year}</td>
                <td className="td">${p.basicSalary?.toLocaleString()}</td>
                {isHR()&&<>
                  <td className="td text-emerald-700">+${p.allowances}</td>
                  <td className="td text-emerald-700">+${p.bonus}</td>
                  <td className="td text-red-500">-${p.taxDeduction+p.otherDeductions}</td>
                </>}
                <td className="td font-bold text-gray-900">${p.netSalary?.toLocaleString()}</td>
                <td className="td"><span className={`badge ${p.status==='paid'?'badge-green':'badge-yellow'}`}>{p.status}</span></td>
                {isHR()&&<td className="td">{p.status==='pending'&&<button onClick={()=>markPaid(p._id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Mark Paid"><CheckCircle size={16}/></button>}</td>}
              </tr>
            ))}
            {payrolls.length===0&&<tr><td colSpan="9" className="td text-center py-10 text-gray-400">No payroll records</td></tr>}
          </tbody>
        </table>
      </div>

      {modal&&(
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-lg">Generate Payroll</h2>
              <button onClick={()=>setModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18}/></button>
            </div>
            <form onSubmit={generate} className="p-6 space-y-4">
              <div>
                <label className="label">Employee</label>
                <select className="input" required value={form.employeeId} onChange={e=>setForm({...form,employeeId:e.target.value})}>
                  <option value="">Select…</option>
                  {employees.map(e=><option key={e._id} value={e._id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Month</label>
                  <select className="input" value={form.month} onChange={e=>setForm({...form,month:parseInt(e.target.value)})}>
                    {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div><label className="label">Year</label>
                  <input className="input" type="number" value={form.year} onChange={e=>setForm({...form,year:parseInt(e.target.value)})}/>
                </div>
              </div>
              {[['Allowances','allowances'],['Overtime','overtime'],['Bonus','bonus'],['Tax Deduction','taxDeduction'],['Other Deductions','otherDeductions']].map(([lbl,key])=>(
                <div key={key}>
                  <label className="label">{lbl} ($)</label>
                  <input className="input" type="number" min="0" value={form[key]} onChange={e=>setForm({...form,[key]:parseFloat(e.target.value)||0})}/>
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={()=>setModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Generate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
