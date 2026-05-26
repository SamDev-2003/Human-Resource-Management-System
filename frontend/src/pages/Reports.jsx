import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import API from '../utils/api.js';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Reports() {
  const [month, setMonth] = useState(new Date().getMonth()+1);
  const [year]            = useState(new Date().getFullYear());
  const [loading, setL]   = useState('');

  const download = async (url, filename, key) => {
    setL(key);
    try {
      const res = await API.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type:'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      toast.success('Download started!');
    } catch { toast.error('Download failed'); }
    finally { setL(''); }
  };

  const cards = [
    { key:'emp',  icon:'👥', title:'Employee Report',  desc:'All active employees with department info',           color:'border-blue-200 bg-blue-50',   btn:'btn-primary',   action:()=>download('/reports/download/employees','employees-report.pdf','emp') },
    { key:'pay',  icon:'💰', title:'Payroll Report',   desc:`Salary breakdown for ${MONTHS[month-1]} ${year}`,    color:'border-emerald-200 bg-emerald-50', btn:'btn-success', action:()=>download(`/reports/download/payroll?month=${month}&year=${year}`,`payroll-${month}-${year}.pdf`,'pay') },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-600">Month filter:</label>
        <select className="input w-44" value={month} onChange={e=>setMonth(parseInt(e.target.value))}>
          {MONTHS.map((m,i)=><option key={i} value={i+1}>{m} {year}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map(({ key, icon, title, desc, color, btn, action }) => (
          <div key={key} className={`card border-2 ${color}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-4xl">{icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
              <button onClick={action} disabled={loading===key} className={`${btn} shrink-0`}>
                {loading===key
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  : <><Download size={15}/> PDF</>}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><FileText size={18} className="text-gray-400"/>Notes</h2>
        <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
          <li>Employee report includes all currently active employees</li>
          <li>Select the month above before downloading the payroll report</li>
          <li>PDFs are generated on the server and downloaded instantly</li>
        </ul>
      </div>
    </div>
  );
}
