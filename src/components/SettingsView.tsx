import React, { useState } from 'react';
import { User, Shield, Bell, Smartphone, Globe, Save, Lock, Key } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { authenticatedFetch } from '../lib/api';

const SettingsView: React.FC = () => {
  const username = useAuthStore(state => state.username);
  const [activeTab, setActiveTab] = useState('profile');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'security', label: 'Security & Password', icon: Shield },
    { id: 'notif', label: 'Notifications', icon: Bell },
    { id: 'devices', label: 'Connected Devices', icon: Smartphone },
    { id: 'region', label: 'Language & Region', icon: Globe },
  ];

  const handleSaveProfile = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setSaveStatus('error');
      setErrorMessage('New passwords do not match');
      return;
    }

    setSaveStatus('saving');
    try {
      const res = await authenticatedFetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (res.ok) {
        setSaveStatus('success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        const data = await res.json();
        setSaveStatus('error');
        setErrorMessage(data.error || 'Failed to update password');
      }
    } catch (e) {
      setSaveStatus('error');
      setErrorMessage('Network error occurred');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
          {React.createElement(tabs.find(t => t.id === activeTab)?.icon || User, { size: 24, className: "text-nexus-accent" })}
        </div>
        <div>
          <h1 className="text-3xl font-bold glow-text">Account Settings</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">
            {tabs.find(t => t.id === activeTab)?.label}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-8">
        <aside className="space-y-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSaveStatus('idle');
                setErrorMessage('');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-nexus-accent text-slate-900 shadow-lg shadow-nexus-accent/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </aside>

        <div className="space-y-6">
          <div className="bg-slate-950/40 border border-white/5 p-6 md:p-10 rounded-[32px] space-y-8 min-h-[450px]">
            {activeTab === 'profile' && (
              <>
                <section className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-nexus-accent" />
                    Personal Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Username</label>
                      <input 
                        type="text" 
                        defaultValue={username || ''}
                        readOnly
                        className="w-full bg-slate-900/30 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-400 outline-none cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="nexus-user@example.com"
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-nexus-accent/50 transition-all"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-6 pt-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-nexus-violet" />
                    Display Preferences
                  </h3>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-200">Public Profile</p>
                      <p className="text-xs text-slate-500">Allow others to see your pinned tools and history.</p>
                    </div>
                    <div className="w-12 h-6 bg-slate-800 rounded-full relative p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-slate-500 rounded-full" />
                    </div>
                  </div>
                </section>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={saveStatus === 'saving'}
                    className={`${saveStatus === 'success' ? 'bg-green-500' : 'bg-nexus-accent'} text-slate-900 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-[1.03] active:scale-[0.97] transition-all shadow-xl shadow-nexus-accent/20 disabled:opacity-70`}
                  >
                    {saveStatus === 'saving' ? <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" /> : saveStatus === 'success' ? 'Updated!' : <><Save className="w-4 h-4" /> Save Changes</>}
                  </button>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Change Password
                </h3>

                {saveStatus === 'error' && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {errorMessage}
                  </div>
                )}

                {saveStatus === 'success' && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                    Password updated successfully!
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="password" 
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-200 outline-none focus:border-nexus-accent/50 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="h-px bg-white/5 my-4" />

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="password" 
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-200 outline-none focus:border-nexus-accent/50 transition-all"
                        placeholder="Min. 8 characters"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="password" 
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-200 outline-none focus:border-nexus-accent/50 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit"
                    disabled={saveStatus === 'saving'}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-[1.03] active:scale-[0.97] transition-all shadow-xl shadow-red-500/20 disabled:opacity-70"
                  >
                    {saveStatus === 'saving' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Update Password'}
                  </button>
                </div>
              </form>
            )}

            {activeTab !== 'profile' && activeTab !== 'security' && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                   {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Globe, { size: 32 })}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-200 capitalize">{activeTab} Settings</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">This section is currently under development. Stay tuned for future Nexus-571 updates.</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border border-red-500/20 rounded-[32px] bg-red-500/5 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-red-400 font-bold text-sm">Danger Zone</h4>
              <p className="text-[10px] text-slate-500">Permanently delete your Nexus-571 account and all data.</p>
            </div>
            <button className="text-red-400 text-xs font-bold border border-red-500/20 px-6 py-2 rounded-xl hover:bg-red-500/10 transition-all whitespace-nowrap">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
