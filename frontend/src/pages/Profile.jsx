import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import API from '../utils/api.js';
import toast from 'react-hot-toast';
import { Shield, Lock } from 'lucide-react';

const roleLabel = { admin:'Administrator', hr_manager:'HR Manager', employee:'Employee' };
const roleColor = { admin:'badge-blue', hr_manager:'badge-green', employee:'badge-gray' };

export default function Profile() {
  const { user } = useAuth();
  const [pw, setPw] = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [busy, setBusy] = useState(false);

  const changePw = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return toast.error('Passwords do not match');
    if (pw.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setBusy(true);
    try {
      await API.put('/auth/change-password', { currentPassword:pw.currentPassword, newPassword:pw.newPassword });
      toast.success('Password updated!');
      setPw({ currentPassword:'', newPassword:'', confirm:'' });
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Profile card */}
      <div className="card">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className={`badge mt-1 ${roleColor[user?.role]}`}>{roleLabel[user?.role]}</span>
          </div>
        </div>
        <div className="border-t pt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Role</p>
            <p className="text-sm font-medium text-gray-800 capitalize">{roleLabel[user?.role]}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Account ID</p>
            <p className="text-xs font-mono text-gray-500">{user?.id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Account Status</p>
            <span className="badge badge-green">Active</span>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock size={18} className="text-gray-400"/>Change Password
        </h2>
        <form onSubmit={changePw} className="space-y-4">
          {[['Current Password','currentPassword'],['New Password','newPassword'],['Confirm New Password','confirm']].map(([lbl,key])=>(
            <div key={key}>
              <label className="label">{lbl}</label>
              <input className="input" type="password" required minLength={key==='currentPassword'?1:6}
                value={pw[key]} onChange={e=>setPw({...pw,[key]:e.target.value})}/>
            </div>
          ))}
          <button type="submit" disabled={busy} className="btn-primary">
            {busy?'Saving…':'Update Password'}
          </button>
        </form>
      </div>

      <div className="card bg-blue-50 border border-blue-100">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-blue-600 shrink-0 mt-0.5"/>
          <div>
            <p className="text-sm font-medium text-blue-900">Security Note</p>
            <p className="text-xs text-blue-700 mt-1">Use a strong password with at least 8 characters, uppercase letters, numbers and special characters for better account security.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
