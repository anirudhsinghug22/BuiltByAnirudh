'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { fetchAllQuotations, updateQuotation } from '@/lib/supabase';
import { FEATURES } from '@/lib/pricing-data';
import confetti from 'canvas-confetti';
import { 
  Search, Filter, ExternalLink, RefreshCw, Calendar, Edit, XCircle, Lock, LogOut, ShieldCheck, Key, Eye, EyeOff
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  
  // Authentication Gate States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Change Password States
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changePassError, setChangePassError] = useState('');
  const [changePassSuccess, setChangePassSuccess] = useState('');

  // CRM Data States
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  
  // Quick status editing state
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editFollowUp, setEditFollowUp] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Get active passcode from localStorage or fallback to default
  const getActivePasscode = () => {
    try {
      return localStorage.getItem('admin-passcode') || 'builtbyanirudh@admin';
    } catch (e) {
      return 'builtbyanirudh@admin';
    }
  };

  // Check auth on load
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('admin-authenticated');
      if (savedAuth === 'true') {
        setIsAuthenticated(true);
        loadLeads();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  async function loadLeads() {
    setLoading(true);
    try {
      const data = await fetchAllQuotations();
      setLeads(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Handle Authentication submit
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activePasscode = getActivePasscode();
    if (passwordInput === activePasscode) {
      setAuthError('');
      try {
        localStorage.setItem('admin-authenticated', 'true');
      } catch (err) {
        console.error(err);
      }
      
      confetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.7 }
      });

      setIsAuthenticated(true);
      loadLeads();
    } else {
      setAuthError('Invalid administrator passcode. Access denied.');
    }
  };

  // Handle Log Out
  const handleLogOut = () => {
    try {
      localStorage.removeItem('admin-authenticated');
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(false);
    setPasswordInput('');
    setLeads([]);
  };

  // Handle Changing Passcode
  const handleChangePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activePasscode = getActivePasscode();

    if (currentPassword !== activePasscode) {
      setChangePassError('Current passcode is incorrect.');
      setChangePassSuccess('');
      return;
    }

    if (newPassword.length < 4) {
      setChangePassError('New passcode must be at least 4 characters long.');
      setChangePassSuccess('');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setChangePassError('Confirm passcode does not match new passcode.');
      setChangePassSuccess('');
      return;
    }

    try {
      localStorage.setItem('admin-passcode', newPassword);
      setChangePassSuccess('Passcode successfully updated!');
      setChangePassError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      
      // Trigger success confetti
      confetti({
        particleCount: 40,
        spread: 30,
        origin: { y: 0.7 }
      });

      // Automatically close modal after 1.5 seconds
      setTimeout(() => {
        setIsChangingPassword(false);
        setChangePassSuccess('');
      }, 1500);

    } catch (err) {
      console.error(err);
      setChangePassError('Failed to save passcode in local storage.');
    }
  };

  // Handle lead status updates
  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setIsUpdating(true);
    try {
      const updated = await updateQuotation(selectedLead.id, {
        status: editStatus,
        notes: editNotes,
        follow_up_date: editFollowUp || null
      });

      // Update local state list
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setSelectedLead(updated);
      alert('Lead successfully updated!');
    } catch (e) {
      console.error(e);
      alert('Failed to update lead details.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelectLead = (lead: any) => {
    setSelectedLead(lead);
    setEditStatus(lead.status);
    setEditNotes(lead.notes || '');
    setEditFollowUp(lead.follow_up_date || '');
  };

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.client_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate CRM Pipeline Metrics in Rupees
  const totalLeads = leads.length;
  const acceptedLeads = leads.filter((l) => l.status === 'accepted');
  const rejectedLeads = leads.filter((l) => l.status === 'rejected');
  const pendingLeads = leads.filter((l) => ['draft', 'sent', 'viewed', 'negotiation'].includes(l.status));
  
  const pipelineRevenue = leads
    .filter((l) => l.status !== 'rejected')
    .reduce((sum, l) => sum + (l.estimated_cost_min + l.estimated_cost_max) / 2, 0);

  const conversionRate = totalLeads > 0 
    ? Math.round((acceptedLeads.length / totalLeads) * 100) 
    : 0;

  // Extract feature stats for analytics charts
  const featureCounts: Record<string, number> = {};
  leads.forEach((l) => {
    const features = l.selected_features || [];
    features.forEach((fid: string) => {
      featureCounts[fid] = (featureCounts[fid] || 0) + 1;
    });
  });

  // Map to full feature details and sort by count
  const sortedFeatureStats = Object.keys(featureCounts)
    .map((fid) => {
      const feat = FEATURES.find((f) => f.id === fid);
      return {
        id: fid,
        name: feat?.name || fid,
        count: featureCounts[fid]
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // top 5 popular features

  // Loader View during hydration auth check
  if (checkingAuth) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-[#D4683C] animate-spin" />
        </div>
      </div>
    );
  }

  // RENDER ADMIN GATE IF NOT LOGGED IN
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full rounded-3xl p-8 border border-[#E3D7C5] dark:border-slate-800 shadow-2xl relative overflow-hidden">
            
            {/* Header Lock Icon */}
            <div className="w-12 h-12 rounded-2xl bg-[#D4683C]/10 border border-[#D4683C]/20 flex items-center justify-center text-[#D4683C] mx-auto mb-6">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>

            <div className="text-center space-y-2 mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">BuiltByAnirudh CRM Gate</h2>
              <p className="text-xs text-slate-650 dark:text-slate-400 font-bold max-w-xs mx-auto">
                Authorized access only. Enter your administrator passcode to review scoping quotients.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-700 dark:text-slate-400 block uppercase tracking-wider">Admin Passcode</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter administrator password..."
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 border border-slate-350 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4683C]/20 focus:border-[#D4683C] font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-1 text-slate-450 hover:text-[#D4683C] dark:hover:text-[#D4683C] transition-colors cursor-pointer"
                    title={showPassword ? "Hide passcode" : "Show passcode"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {authError && (
                <p className="text-[10px] text-red-500 font-black text-center">{authError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#D4683C] hover:bg-[#BD562B] text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-[#D4683C]/15 active:scale-98 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                Unlock Dashboard
              </button>
            </form>

            {/* Decorative details */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#D4683C]/5 to-transparent rounded-bl-full pointer-events-none" />
            
          </div>
        </div>
      </div>
    );
  }

  // RENDER CRM DASHBOARD (AUTHENTICATED)
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Sales CRM & Pipelines</h1>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-1.5 font-bold">Manage quotation requirements, pipelines, revenue models and client approvals.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadLeads}
              disabled={loading}
              className="px-4 py-2 border border-slate-350 dark:border-slate-800 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Leads
            </button>

            {/* Change Passcode Button */}
            <button
              onClick={() => setIsChangingPassword(true)}
              className="px-4 py-2 border border-slate-350 dark:border-slate-800 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Key className="w-3.5 h-3.5 text-[#D4683C]" />
              Settings
            </button>
            
            {/* Log Out Button */}
            <button
              onClick={handleLogOut}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Lock CRM
            </button>
          </div>
        </div>

        {/* METRICS GRID IN RUPEES */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          
          <div className="glass-card rounded-2xl p-5 border border-slate-300 dark:border-slate-800 space-y-1 bg-white dark:bg-[#191513]">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Total Quotes</span>
            <div className="text-2xl font-black text-slate-950 dark:text-white leading-none">{totalLeads}</div>
            <span className="text-[10px] text-slate-700 dark:text-slate-400 block pt-1.5 font-medium">All generated requests</span>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-300 dark:border-slate-800 space-y-1 bg-white dark:bg-[#191513]">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Pipeline Value</span>
            <div className="text-xl sm:text-2xl font-black text-[#D4683C] leading-none truncate" title={`Rs. ${Math.round(pipelineRevenue).toLocaleString()}`}>
              Rs. {Math.round(pipelineRevenue).toLocaleString()}
            </div>
            <span className="text-[10px] text-[#D4683C] font-extrabold block pt-1.5">Avg cost aggregation</span>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-300 dark:border-slate-800 space-y-1 bg-white dark:bg-[#191513]">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Accepted Leads</span>
            <div className="text-2xl font-black text-slate-950 dark:text-white leading-none">{acceptedLeads.length}</div>
            <span className="text-[10px] text-[#4E7852] dark:text-[#6E9E73] font-extrabold block pt-1.5">Signed & approved</span>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-300 dark:border-slate-800 space-y-1 bg-white dark:bg-[#191513]">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Pending Reviews</span>
            <div className="text-2xl font-black text-slate-950 dark:text-white leading-none">{pendingLeads.length}</div>
            <span className="text-[10px] text-[#D4683C] font-extrabold block pt-1.5">Draft or negotiation</span>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-300 dark:border-slate-800 col-span-2 md:col-span-1 space-y-1 bg-white dark:bg-[#191513]">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Conversion Rate</span>
            <div className="text-2xl font-black text-slate-950 dark:text-white leading-none">{conversionRate}%</div>
            <span className="text-[10px] text-slate-700 dark:text-slate-400 block pt-1.5 font-medium">Closed-Won ratio</span>
          </div>

        </div>

        {/* ANALYTICS POPULAR FEATURES & DISTRIBUTION CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Top Features Chart */}
          <div className="md:col-span-7 glass-card rounded-3xl p-6 border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#191513] space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white uppercase tracking-wider">Top Configured Options</h3>
              <p className="text-[10px] text-slate-650 dark:text-slate-400 mt-1 font-medium">Most requested design attributes and system integrations across leads.</p>
            </div>

            {sortedFeatureStats.length === 0 ? (
              <div className="text-center py-12 text-slate-550 dark:text-slate-400 text-xs font-bold">
                No features aggregated. Generate quotes to populate charts.
              </div>
            ) : (
              <div className="space-y-4">
                {sortedFeatureStats.map((stat, idx) => {
                  const pct = Math.round((stat.count / totalLeads) * 100);
                  return (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-900 dark:text-slate-300">{stat.name}</span>
                        <span className="text-[#D4683C]">{stat.count} Quotes ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#D4683C] to-[#E5835C]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Lead Status Overview Chart */}
          <div className="md:col-span-5 glass-card rounded-3xl p-6 border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#191513] flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white uppercase tracking-wider">Status Distribution</h3>
              <p className="text-[10px] text-slate-650 dark:text-slate-400 mt-1 font-medium">Current status splits of lead documents in database.</p>
            </div>

            {totalLeads === 0 ? (
              <div className="text-center py-12 text-slate-550 dark:text-slate-400 text-xs font-bold">
                No active quotes generated.
              </div>
            ) : (
              <div className="space-y-3.5 text-xs font-bold">
                {[
                  { label: 'Accepted', count: acceptedLeads.length, color: 'bg-[#4E7852]' },
                  { label: 'Pending Negotiation', count: leads.filter((l) => l.status === 'negotiation').length, color: 'bg-[#D4683C]' },
                  { label: 'Sent', count: leads.filter((l) => l.status === 'sent').length, color: 'bg-blue-600' },
                  { label: 'Draft', count: leads.filter((l) => l.status === 'draft').length, color: 'bg-slate-450' },
                  { label: 'Rejected', count: rejectedLeads.length, color: 'bg-red-500' }
                ].map((item, idx) => {
                  const pct = Math.round((item.count / totalLeads) * 100);
                  if (item.count === 0) return null;
                  return (
                    <div key={idx} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        <span className="text-slate-900 dark:text-slate-300">{item.label}</span>
                      </div>
                      <span className="text-slate-550 dark:text-slate-400 text-[10px] font-black">{item.count} Leads ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-400">
              Avg timeline: {totalLeads > 0 ? (leads.reduce((sum, l) => sum + l.estimated_days, 0) / totalLeads / 20).toFixed(1) : 0} Months.
            </div>
          </div>

        </div>

        {/* LEAD LIST CRM DATABASE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CRM Leads Table */}
          <div className={`${selectedLead ? 'lg:col-span-8' : 'lg:col-span-12'} glass-card rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#191513] shadow-sm transition-all duration-300`}>
            
            {/* Filter Panel Bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-250 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
              
              {/* Search */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search client/business..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#191513] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#D4683C]"
                />
              </div>

              {/* Status Select Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#191513] rounded-xl text-[11px] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#D4683C]"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="viewed">Viewed</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

            </div>

            {/* Main Table */}
            {loading ? (
              <div className="text-center py-20 text-slate-550 text-xs font-bold">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D4683C]" />
                Loading leads repository...
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-20 text-slate-550 dark:text-slate-400 text-xs font-bold">
                No quotation leads matching the query.
              </div>
            ) : (
              <div className="overflow-x-auto text-xs font-bold">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-250 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px]">
                      <th className="p-4">Business / Lead</th>
                      <th className="p-4">Category / Segment</th>
                      <th className="p-4 text-right">Estimate Cost</th>
                      <th className="p-4 text-center">Timeline</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-semibold text-slate-750 dark:text-slate-200">
                    {filteredLeads.map((lead) => {
                      const isSelected = selectedLead?.id === lead.id;
                      return (
                        <tr 
                          key={lead.id}
                          onClick={() => handleSelectLead(lead)}
                          className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#D4683C]/5' : ''
                          }`}
                        >
                          <td className="p-4">
                            <div className="font-extrabold text-[#151210] dark:text-slate-100">{lead.business_name}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-450 font-bold">{lead.client_email}</div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-black">
                              {lead.industry || 'General'}
                            </span>
                          </td>
                          <td className="p-4 text-right font-black text-[#151210] dark:text-slate-200">
                            Rs. {lead.estimated_cost_min.toLocaleString()} - Rs. {lead.estimated_cost_max.toLocaleString()}
                          </td>
                          <td className="p-4 text-center font-bold text-slate-900 dark:text-slate-200">
                            ~{(lead.estimated_days / 20).toFixed(1)} Months
                            <div className="text-[9px] text-slate-500 dark:text-slate-450 font-normal">({lead.estimated_days} days)</div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                              lead.status === 'accepted' ? 'bg-[#4E7852]/10 border-[#4E7852]/20 text-[#4E7852] dark:text-[#6E9E73]' :
                              lead.status === 'negotiation' ? 'bg-[#D4683C]/10 border-[#D4683C]/20 text-[#D4683C]' :
                              lead.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' :
                              'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                            }`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/proposal/${lead.id}`);
                              }}
                              className="p-1.5 border border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-650 hover:text-[#D4683C] cursor-pointer"
                              title="Open proposal document"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-[#D4683C]" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>

          {/* CRM Lead Slider Editor */}
          {selectedLead && (
            <div className="lg:col-span-4 glass-card rounded-3xl p-6 border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#191513] shadow-md space-y-6">
              
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[9px] font-black uppercase text-[#D4683C]">Leads Inspector</span>
                  <h3 className="font-extrabold text-sm text-slate-950 dark:text-white truncate max-w-48 mt-0.5">{selectedLead.business_name}</h3>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Lead detail lists */}
              <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-400">
                <div>
                  <strong className="text-slate-900 dark:text-white">Business Description:</strong>
                  <p className="italic text-[11px] mt-0.5 font-medium">"{selectedLead.business_description || 'No direct summary supplied.'}"</p>
                </div>
                <div>
                  <strong className="text-slate-900 dark:text-white">Selected Options:</strong>
                  <span className="block mt-1 font-bold text-[10px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 max-h-24 overflow-y-auto">
                    {selectedLead.selected_features.length - 1 + (selectedLead.custom_pages?.length || 0)} items configured.
                  </span>
                </div>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleUpdateLead} className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase block">Follow Up Date</label>
                  <input
                    type="date"
                    value={editFollowUp}
                    onChange={(e) => setEditFollowUp(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#D4683C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase block">Quotation Pipeline Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="viewed">Viewed</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase block">Internal Admin Comments</label>
                  <textarea
                    rows={3}
                    placeholder="Enter CRM negotiation notes..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#D4683C]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-2.5 bg-[#D4683C] hover:bg-[#BD562B] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer active:scale-95 disabled:opacity-40"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="w-3.5 h-3.5" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>

            </div>
          )}

        </div>

      </div>

      {/* CHANGE PASSCODE MODAL */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 bg-[#151210]/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full rounded-3xl p-6 border border-[#E3D7C5] dark:border-slate-800 shadow-2xl relative">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-850 mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#D4683C]" />
                <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Passcode Settings</h3>
              </div>
              <button 
                onClick={() => {
                  setIsChangingPassword(false);
                  setChangePassError('');
                  setChangePassSuccess('');
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleChangePasscodeSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 block uppercase">Current Passcode</label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password..."
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-350 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#D4683C]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 block uppercase">New Passcode</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new passcode (min 4 chars)..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-355 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#D4683C]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 block uppercase">Confirm New Passcode</label>
                <input
                  type="password"
                  required
                  placeholder="Confirm new passcode..."
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-355 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#D4683C]"
                />
              </div>

              {changePassError && (
                <p className="text-[10px] text-red-500 font-black text-center">{changePassError}</p>
              )}

              {changePassSuccess && (
                <p className="text-[10px] text-[#4E7852] dark:text-[#6E9E73] font-black text-center">{changePassSuccess}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#D4683C] hover:bg-[#BD562B] text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-98"
              >
                Update Passcode
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
