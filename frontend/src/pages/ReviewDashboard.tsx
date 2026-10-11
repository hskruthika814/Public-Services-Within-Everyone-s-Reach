import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { authenticateCredentials } from '../data/demoUsers';
import { DEFAULT_COMPLAINTS } from '../data/defaultComplaints';
import { 
  Search, Filter, User, Mail, Phone, MapPin, Clock, ShieldAlert, 
  CheckCircle2, AlertTriangle, RefreshCw, ExternalLink, MessageSquare, 
  ShieldCheck, CheckCircle, RotateCcw, Award, Check, Lock, LogOut,
  ChevronDown, ChevronUp, History, KeyRound, Sparkles, ArrowRight,
  Shield, CheckSquare, FileText
} from 'lucide-react';
import { SpeechStatusButton } from '../components/SpeechStatusButton';

interface ReviewRecord {
  complaintId: number;
  trackingRef?: string;
  reviewedAt: string;
  status: string;
  priority?: string;
  notes?: string;
}

export interface DeptOfficer {
  code: string;
  deptName: string;
  officerName: string;
  email: string;
  icon: string;
  color: string;
  tagColor: string;
}

export const DEPARTMENT_OFFICERS: DeptOfficer[] = [
  { code: 'PWD', deptName: 'Public Works Department', officerName: 'Suresh Kumar', email: 'staff.pwd@civicease.demo', icon: '🏗️', color: 'border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-amber-900', tagColor: 'bg-amber-600 text-white' },
  { code: 'ELEC', deptName: 'Electrical Department', officerName: 'Priya Sharma', email: 'staff.elec@civicease.demo', icon: '⚡', color: 'border-yellow-300 bg-yellow-50/70 hover:bg-yellow-100 text-yellow-900', tagColor: 'bg-yellow-600 text-white' },
  { code: 'WATER', deptName: 'Water Supply Department', officerName: 'Rajan Pillai', email: 'staff.water@civicease.demo', icon: '💧', color: 'border-blue-300 bg-blue-50/70 hover:bg-blue-100 text-blue-900', tagColor: 'bg-blue-600 text-white' },
  { code: 'SANIT', deptName: 'Sanitation Department', officerName: 'Kavitha Nair', email: 'staff.sanit@civicease.demo', icon: '🧹', color: 'border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900', tagColor: 'bg-emerald-600 text-white' },
  { code: 'DRAIN', deptName: 'Drainage Department', officerName: 'Mohammed Ali', email: 'staff.drain@civicease.demo', icon: '🌊', color: 'border-cyan-300 bg-cyan-50/70 hover:bg-cyan-100 text-cyan-900', tagColor: 'bg-cyan-600 text-white' },
  { code: 'PARKS', deptName: 'Parks & Public Facilities', officerName: 'Anita Desai', email: 'staff.parks@civicease.demo', icon: '🌳', color: 'border-green-300 bg-green-50/70 hover:bg-green-100 text-green-900', tagColor: 'bg-green-600 text-white' },
  { code: 'SAFETY', deptName: 'Public Safety Department', officerName: 'Vikram Singh', email: 'staff.safety@civicease.demo', icon: '🚨', color: 'border-red-300 bg-red-50/70 hover:bg-red-100 text-red-900', tagColor: 'bg-red-600 text-white' },
  { code: 'GEN', deptName: 'General Services', officerName: 'Lakshmi Rao', email: 'staff.gen@civicease.demo', icon: '🏢', color: 'border-purple-300 bg-purple-50/70 hover:bg-purple-100 text-purple-900', tagColor: 'bg-purple-600 text-white' },
];

const STORAGE_KEY = 'civicease_reviewed_complaints_v1';

export function ReviewDashboard() {
  const { user, login: authLogin, logout: authLogout } = useAuth();

  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [reviewTab, setReviewTab] = useState<'all' | 'pending' | 'reviewed'>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [reviewNotes, setReviewNotes] = useState<{ [id: number]: string }>({});
  const [activeModalComplaint, setActiveModalComplaint] = useState<any | null>(null);
  const [modalStatus, setModalStatus] = useState('');
  const [modalRemarks, setModalRemarks] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  
  // State for login form when not authenticated
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Toggle timeline history per complaint card
  const [expandedHistoryIds, setExpandedHistoryIds] = useState<{ [id: number]: boolean }>({});

  // Persistent storage for reviewed complaints: Starts at 0 until reviewed!
  const [reviewedRecords, setReviewedRecords] = useState<{ [id: number]: ReviewRecord }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const fetchComplaints = async () => {
    setLoading(true);
    let loadedFromApi = false;
    try {
      const res = await api.get('/complaints/all');
      if (res.data?.complaints && Array.isArray(res.data.complaints) && res.data.complaints.length > 0) {
        setComplaints(res.data.complaints);
        loadedFromApi = true;
      }
    } catch (err) {
      console.warn('API /complaints/all unavailable; falling back to local and demo complaints', err);
    }

    if (!loadedFromApi) {
      try {
        const localStored: any[] = JSON.parse(localStorage.getItem('civicease_local_complaints') || '[]');
        const combined = [...localStored];
        for (const def of DEFAULT_COMPLAINTS) {
          if (!combined.some(c => c.tracking_ref === def.tracking_ref || c.id === def.id)) {
            combined.push(def);
          }
        }
        setComplaints(combined);
      } catch {
        setComplaints(DEFAULT_COMPLAINTS);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user]);

  // Handle Authentication inside the Dashboard
  const handleDashboardLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const emailToUse = (customEmail || loginEmail).trim();
    const pwdToUse = customPassword || loginPassword;

    if (!emailToUse) {
      setLoginError('Please enter your officer or user email.');
      setLoginLoading(false);
      return;
    }

    try {
      const { token, user: authenticatedUser } = await authenticateCredentials(emailToUse, pwdToUse);
      authLogin(token, authenticatedUser);
      setActionSuccessMsg(`Authenticated as ${authenticatedUser.full_name} (${authenticatedUser.role.toUpperCase()}). Complaint history unlocked!`);
      setTimeout(() => setActionSuccessMsg(''), 5000);
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Quick 1-click Demo Logins
  const handleQuickDemoLogin = (email: string, roleTitle: string, pwd = 'Staff@123') => {
    setLoginEmail(email);
    setLoginPassword(pwd);
    handleDashboardLogin(undefined, email, pwd);
  };

  // Store review record in state and localStorage
  const recordReview = (complaint: any, status?: string, notes?: string) => {
    const finalStatus = status || complaint.status || 'under_review';
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated: { [id: number]: ReviewRecord } = {
      ...reviewedRecords,
      [complaint.id]: {
        complaintId: complaint.id,
        trackingRef: complaint.tracking_ref,
        reviewedAt: nowStr,
        status: finalStatus,
        priority: complaint.priority,
        notes: notes || complaint.resolution_notes || `Reviewed by Officer ${user?.full_name || ''}`
      }
    };
    setReviewedRecords(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleMarkAsReviewed = (complaint: any) => {
    const isAlreadyReviewed = !!reviewedRecords[complaint.id];
    if (isAlreadyReviewed) {
      // Toggle un-review if clicked again
      const copy = { ...reviewedRecords };
      delete copy[complaint.id];
      setReviewedRecords(copy);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
      setActionSuccessMsg(`Complaint ${complaint.tracking_ref} unmarked. Counter updated.`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
      return;
    }

    recordReview(complaint, complaint.status, `Verified & Reviewed by Officer ${user?.full_name || 'Staff'}`);
    setActionSuccessMsg(`Complaint ${complaint.tracking_ref} successfully reviewed! Number stored in dashboard.`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const handleResetCounters = () => {
    if (window.confirm("Are you sure you want to reset all review boxes back to 0?")) {
      setReviewedRecords({});
      localStorage.removeItem(STORAGE_KEY);
      setActionSuccessMsg("All dashboard review metric boxes have been reset to 0.");
      setTimeout(() => setActionSuccessMsg(''), 4000);
    }
  };

  const updateLocalComplaintStatus = (complaintId: number, trackingRef: string, newStatus: string, notes: string) => {
    setComplaints(prev => prev.map(c => (c.id === complaintId || c.tracking_ref === trackingRef) ? { ...c, status: newStatus, resolution_notes: notes } : c));
    try {
      const localList = JSON.parse(localStorage.getItem('civicease_local_complaints') || '[]');
      const idx = localList.findIndex((c: any) => c.id === complaintId || c.tracking_ref === trackingRef);
      if (idx >= 0) {
        localList[idx].status = newStatus;
        localList[idx].resolution_notes = notes;
      } else {
        const found = complaints.find(c => c.id === complaintId || c.tracking_ref === trackingRef);
        if (found) {
          localList.unshift({ ...found, status: newStatus, resolution_notes: notes });
        }
      }
      localStorage.setItem('civicease_local_complaints', JSON.stringify(localList));
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickStatusChange = async (complaint: any, newStatus: string) => {
    setUpdatingId(complaint.id);
    const notes = reviewNotes[complaint.id] || `Status updated to ${newStatus.replace('_', ' ')} by ${user?.full_name || 'Review Officer'}`;
    try {
      await api.patch(`/complaints/${complaint.id}/review`, {
        status: newStatus,
        remarks: notes
      });
      await fetchComplaints();
    } catch (err) {
      // Local fallback for GitHub Pages / offline mode
      updateLocalComplaintStatus(complaint.id, complaint.tracking_ref, newStatus, notes);
    } finally {
      recordReview(complaint, newStatus, notes);
      setActionSuccessMsg(`Complaint #${complaint.tracking_ref || complaint.id} status updated to ${newStatus.replace('_', ' ')}. Stored in dashboard.`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
      setUpdatingId(null);
    }
  };

  const handleModalReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalComplaint || !modalStatus) return;
    setUpdatingId(activeModalComplaint.id);
    const remarks = modalRemarks || `Status updated to ${modalStatus} by ${user?.full_name || 'Officer'}`;
    try {
      await api.patch(`/complaints/${activeModalComplaint.id}/review`, {
        status: modalStatus,
        remarks
      });
      await fetchComplaints();
    } catch (err) {
      // Local fallback for GitHub Pages / offline mode
      updateLocalComplaintStatus(activeModalComplaint.id, activeModalComplaint.tracking_ref, modalStatus, remarks);
    } finally {
      recordReview(activeModalComplaint, modalStatus, remarks);
      setActionSuccessMsg(`Complaint ${activeModalComplaint.tracking_ref} reviewed and saved. Number stored in dashboard.`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
      setActiveModalComplaint(null);
      setModalStatus('');
      setModalRemarks('');
      setUpdatingId(null);
    }
  };

  const toggleHistory = (complaintId: number) => {
    setExpandedHistoryIds(prev => ({
      ...prev,
      [complaintId]: !prev[complaintId]
    }));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. AUTHENTICATION GATE: IF NOT LOGGED IN, SHOW LOGIN PROCESS FIRST
  // ─────────────────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gov-border overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-gov-navy to-gov-blue p-8 text-white text-center relative">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
              <ShieldCheck className="text-gov-saffron" size={36} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <Lock size={12} /> Officer Authentication Required
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Review Dashboard Access Console
            </h1>
            <p className="text-blue-100 text-sm mt-2 max-w-xl mx-auto">
              Please authenticate to access the complaint tracking console, view complete citizen grievance histories, and record review counts.
            </p>
          </div>

          <div className="p-8 md:p-10">
            {loginError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 rounded-xl animate-fade-in">
                <AlertTriangle className="shrink-0 mt-0.5 text-red-500" size={18} />
                <div>
                  <strong className="font-semibold block">Authentication Error</strong>
                  <span>{loginError}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Login Form */}
              <div className="md:col-span-7 bg-gray-50/70 p-6 rounded-xl border border-gray-200">
                <h2 className="text-base font-bold text-gov-navy mb-4 flex items-center gap-2">
                  <KeyRound size={16} className="text-gov-blue" />
                  Sign In with Credentials
                </h2>

                <form onSubmit={handleDashboardLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gov-navy mb-1.5" htmlFor="dash-email">
                      Officer / User Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        id="dash-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="e.g. staff.elec@civicease.demo"
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gov-blue outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gov-navy mb-1.5" htmlFor="dash-password">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        id="dash-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gov-blue outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3 bg-gov-blue text-white rounded-lg font-bold text-sm hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {loginLoading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" /> Authenticating...
                      </>
                    ) : (
                      <>
                        <span>Sign In &amp; Open History Dashboard</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* 1-Click Quick Demo Login for All 8 Department Officers */}
              <div className="md:col-span-5 space-y-4">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-gov-navy mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-gov-saffron" /> 8 Department Officers</span>
                    <span className="text-[10px] bg-blue-100 text-gov-blue px-2 py-0.5 rounded font-mono">1 per Dept</span>
                  </h3>
                  <p className="text-xs text-gov-text-sec mb-2">
                    Click any officer below to authenticate instantly and unlock their isolated complaints:
                  </p>
                </div>

                <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                  {DEPARTMENT_OFFICERS.map((dept) => (
                    <button
                      key={dept.code}
                      type="button"
                      onClick={() => handleQuickDemoLogin(dept.email, `${dept.deptName} Officer`, 'Staff@123')}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all group flex items-center justify-between ${dept.color}`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-base leading-none">{dept.icon}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${dept.tagColor}`}>
                            {dept.code}
                          </span>
                          <span className="text-xs font-bold truncate text-gov-navy group-hover:text-gov-blue">
                            {dept.officerName}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-600 truncate">{dept.deptName}</div>
                      </div>
                      <span className="text-xs font-bold text-gov-blue opacity-70 group-hover:opacity-100 whitespace-nowrap shrink-0">
                        Login &rarr;
                      </span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('admin@civicease.demo', 'System Administrator', 'Admin@123')}
                    className="w-full text-left p-2.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-all group flex items-center justify-between text-purple-900"
                  >
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1">
                        🛡️ <span>System Administrator (All Depts)</span>
                      </div>
                      <div className="text-[11px] text-purple-700 font-mono">admin@civicease.demo</div>
                    </div>
                    <span className="text-xs font-bold text-purple-800 opacity-80 group-hover:opacity-100">
                      Login &rarr;
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('citizen1@civicease.demo', 'Citizen Reviewer', 'Citizen@123')}
                    className="w-full text-left p-2.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-all group flex items-center justify-between text-emerald-900"
                  >
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1">
                        👤 <span>Citizen Submitter Account</span>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-mono">citizen1@civicease.demo</div>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 opacity-80 group-hover:opacity-100">
                      Login &rarr;
                    </span>
                  </button>
                </div>

                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                  <strong>Department Isolation:</strong> Each officer strictly views complaints routed to their own department. Password for all officers is <span className="font-mono font-bold">Staff@123</span>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. AUTHENTICATED: DISPLAY DASHBOARD & COMPLAINT HISTORY
  // ─────────────────────────────────────────────────────────────────────────────

  // ── Strict Department Isolation for Officers ──
  // A department officer ONLY sees complaints belonging to their department!
  const departmentIsolatedComplaints = complaints.filter(c => {
    if (user.role === 'admin') return true;
    if (user.department_code && c.department_code) {
      return c.department_code.toUpperCase() === user.department_code.toUpperCase();
    }
    if (user.department_id && c.department_id) {
      return c.department_id === user.department_id;
    }
    if (user.department && c.department) {
      return c.department.toLowerCase() === user.department.toLowerCase();
    }
    return true;
  });

  // Department Real-time Statistics
  const deptTotal = departmentIsolatedComplaints.length;
  const deptCritical = departmentIsolatedComplaints.filter(c => c.priority === 'critical').length;
  const deptInReview = departmentIsolatedComplaints.filter(c => ['under_review', 'submitted'].includes(c.status)).length;
  const deptInProgress = departmentIsolatedComplaints.filter(c => ['assigned', 'in_progress'].includes(c.status)).length;
  const deptResolved = departmentIsolatedComplaints.filter(c => ['resolved', 'closed'].includes(c.status)).length;

  // Filter complaints based on search query, dropdowns, and review tab from the department isolated set
  const filteredComplaints = departmentIsolatedComplaints.filter(c => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q || 
      (c.tracking_ref && c.tracking_ref.toLowerCase().includes(q)) ||
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      (c.submitter_name && c.submitter_name.toLowerCase().includes(q)) ||
      (c.guest_name && c.guest_name.toLowerCase().includes(q)) ||
      (c.submitter_email && c.submitter_email.toLowerCase().includes(q)) ||
      (c.guest_email && c.guest_email.toLowerCase().includes(q)) ||
      (c.submitter_phone && c.submitter_phone.toLowerCase().includes(q)) ||
      (c.guest_phone && c.guest_phone.toLowerCase().includes(q)) ||
      (c.locality && c.locality.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;

    const matchesReviewTab = 
      reviewTab === 'all' || 
      (reviewTab === 'pending' && ['submitted', 'under_review', 'assigned'].includes(c.status)) || 
      (reviewTab === 'reviewed' && ['in_progress', 'resolved', 'closed'].includes(c.status));

    return matchesSearch && matchesStatus && matchesPriority && matchesReviewTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Submitted</span>;
      case 'under_review':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Under Review</span>;
      case 'assigned':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">Assigned</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">In Progress</span>;
      case 'resolved':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Resolved</span>;
      case 'closed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">Closed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-100 text-red-800 border border-red-300 animate-pulse">
            <AlertTriangle size={12} /> CRITICAL
          </span>
        );
      case 'high':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">HIGH</span>;
      case 'medium':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">MEDIUM</span>;
      case 'low':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">LOW</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{priority}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Officer Authentication Status Strip */}
      <div className="bg-white rounded-xl border border-gov-border p-4 mb-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50/70 to-white">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gov-blue text-white flex items-center justify-center font-bold text-base shadow-sm ring-2 ring-blue-100">
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-gov-navy text-sm md:text-base">{user.full_name}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gov-navy text-white uppercase tracking-wider">
                {user.role}
              </span>
              {user.department && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                  {user.department}
                </span>
              )}
              {user.department_code && (
                <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                  CODE: {user.department_code}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">{user.email} &bull; Authenticated Department Console Session</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={authLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors shadow-sm"
            title="Lock Console and Return to Login"
          >
            <LogOut size={13} /> Lock Console / Sign Out
          </button>
        </div>
      </div>

      {/* Department Isolation Security Alert */}
      {user.role !== 'admin' && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3.5 mb-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-emerald-700 shrink-0" />
            <div>
              <strong className="font-bold text-emerald-950">Department Isolation Active:</strong>{' '}
              <span>
                You are authenticated as <strong>{user.full_name}</strong>. Only complaints assigned to{' '}
                <strong>{user.department || user.department_code}</strong> are visible. Other department grievances are isolated and inaccessible.
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white font-mono text-[11px] font-bold text-emerald-800 border border-emerald-300 self-start sm:self-auto shrink-0">
            🔒 {user.department_code || 'DEPT'} Isolated
          </span>
        </div>
      )}

      {/* 8 Department Officers Fast-Switcher Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3.5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-gov-navy flex items-center gap-1.5">
            <Sparkles size={14} className="text-gov-saffron" /> 8 Department Officers Switcher (Instant 1-Click Verification)
          </span>
          <span className="text-[11px] text-gray-500 font-medium">Click any officer to switch department feed</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {DEPARTMENT_OFFICERS.map((dept) => {
            const isCurrent = user.email === dept.email || (user.department_code && user.department_code === dept.code);
            return (
              <button
                key={dept.code}
                type="button"
                onClick={() => handleQuickDemoLogin(dept.email, `${dept.deptName} Officer`, 'Staff@123')}
                className={`p-2 rounded-lg border text-left transition-all text-xs flex flex-col justify-between ${
                  isCurrent 
                    ? 'border-gov-blue bg-blue-50 ring-2 ring-gov-blue/30 font-bold shadow-xs' 
                    : 'border-gray-200 bg-gray-50/80 hover:bg-white hover:border-gov-blue/50'
                }`}
                title={`Switch to Officer ${dept.officerName} (${dept.deptName})`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-sm">{dept.icon}</span>
                  <span className={`text-[9px] font-bold px-1 py-0.5 rounded font-mono ${isCurrent ? 'bg-gov-blue text-white' : 'bg-gray-200 text-gray-700'}`}>
                    {dept.code}
                  </span>
                </div>
                <div className="text-[11px] truncate font-bold text-gray-800">{dept.officerName.split(' ')[0]}</div>
                <div className="text-[10px] text-gray-500 truncate">{dept.deptName.replace(' Department', '')}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gov-blue-pale text-gov-blue rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} /> Review Console &amp; Grievance History
          </div>
          <h1 className="text-3xl font-extrabold text-gov-navy tracking-tight">
            Complaint Tracker &amp; History Dashboard
          </h1>
          <p className="text-gov-text-sec text-sm mt-1">
            Official grievance review console for <strong className="text-gov-navy font-bold">{user.department || 'Department Officers'}</strong>. Showing grievances mapped to this department.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchComplaints}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gov-border text-gov-navy rounded-md font-medium text-xs hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh Feed
          </button>
          <Link
            to="/submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gov-saffron text-white rounded-md font-semibold text-xs hover:bg-orange-600 transition-colors shadow-sm"
          >
            + New Request
          </Link>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionSuccessMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-semibold flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg('')} className="text-xs text-emerald-700 hover:underline">Dismiss</button>
        </div>
      )}

      {/* 4 DEPARTMENT CASE STAT BOXES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* BOX 1: Total Department Grievances */}
        <div className="bg-white p-5 rounded-xl border border-gov-border shadow-sm hover:border-gov-blue transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Department Grievances
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-gov-blue">
              {user.department_code || 'DEPT'}
            </span>
          </div>
          <div className="text-4xl font-extrabold text-gov-navy my-1 font-mono">
            {deptTotal}
          </div>
          <span className="text-xs text-gray-500 block truncate">
            {user.department ? `${user.department}` : 'Total assigned cases'}
          </span>
        </div>

        {/* BOX 2: Critical Priority Cases */}
        <div className="bg-white p-5 rounded-xl border border-gov-border shadow-sm hover:border-red-300 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-1">
              Critical Emergency
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
              High SLA
            </span>
          </div>
          <div className="text-4xl font-extrabold text-red-600 my-1 font-mono">
            {deptCritical}
          </div>
          <span className="text-xs text-gray-500 block">
            {deptCritical === 0 ? 'No critical safety alerts' : `${deptCritical} emergency priority case(s)`}
          </span>
        </div>

        {/* BOX 3: In Review & Field Action */}
        <div className="bg-white p-5 rounded-xl border border-gov-border shadow-sm hover:border-indigo-300 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
              Under Review &amp; Active
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">
              In Workflow
            </span>
          </div>
          <div className="text-4xl font-extrabold text-indigo-600 my-1 font-mono">
            {deptInReview + deptInProgress}
          </div>
          <span className="text-xs text-gray-500 block">
            {deptInReview} under review &bull; {deptInProgress} in progress
          </span>
        </div>

        {/* BOX 4: Resolved & Closed */}
        <div className="bg-white p-5 rounded-xl border border-gov-border shadow-sm hover:border-emerald-300 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
              Resolved &amp; Closed
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">
              Resolved
            </span>
          </div>
          <div className="text-4xl font-extrabold text-emerald-600 my-1 font-mono">
            {deptResolved}
          </div>
          <span className="text-xs text-gray-500 block">
            {deptResolved === 0 ? 'Awaiting field resolution' : `${deptResolved} grievance(s) completed`}
          </span>
        </div>
      </div>

      {/* Review Tab Filter & Search Row */}
      <div className="bg-white p-4 rounded-xl border border-gov-border shadow-sm mb-6 space-y-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs font-bold">
            <button
              onClick={() => setReviewTab('all')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                reviewTab === 'all' ? 'bg-white text-gov-navy shadow-sm' : 'text-gray-600 hover:text-gov-navy'
              }`}
            >
              <History size={13} />
              All Department Cases ({deptTotal})
            </button>
            <button
              onClick={() => setReviewTab('pending')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                reviewTab === 'pending' ? 'bg-white text-gov-navy shadow-sm' : 'text-gray-600 hover:text-gov-navy'
              }`}
            >
              Under Review &amp; Active ({deptInReview + deptInProgress})
            </button>
            <button
              onClick={() => setReviewTab('reviewed')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
                reviewTab === 'reviewed' ? 'bg-white text-gov-navy shadow-sm' : 'text-gray-600 hover:text-gov-navy'
              }`}
            >
              <CheckCircle size={13} className="text-emerald-600" />
              Resolved &amp; Completed ({deptResolved})
            </button>
          </div>

          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>Official Department Tracking Console</span>
          </div>
        </div>

        {/* Search Input & Selectors */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-grow w-full md:w-auto">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Submitter Name, Email, Phone, Title, or Reference..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gov-blue outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-gray-500 font-bold whitespace-nowrap">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-gov-blue outline-none w-full sm:w-auto"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-gray-500 font-bold whitespace-nowrap">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-gov-blue outline-none w-full sm:w-auto"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Complaints List / History */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gov-border p-12 text-center text-gov-text-sec">
          <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-gov-blue" />
          <p className="font-medium">Loading complaints history for review...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-xl border border-gov-border p-12 text-center">
          <CheckCircle2 size={36} className="mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-bold text-gov-navy mb-1">No Complaints Found</h3>
          <p className="text-gov-text-sec text-sm">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || reviewTab !== 'all'
              ? 'Try adjusting your search criteria or review filters.'
              : 'There are currently no complaints in the system.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredComplaints.map((c) => {
            const submitterName = c.submitter_name || c.citizen_name || c.guest_name || 'Anonymous Citizen';
            const submitterEmail = c.submitter_email || c.citizen_email || c.guest_email || 'Not provided';
            const submitterPhone = c.submitter_phone || c.citizen_phone || c.guest_phone || 'Not provided';
            const isReviewed = !!reviewedRecords[c.id];
            const reviewInfo = reviewedRecords[c.id];
            const isHistoryExpanded = !!expandedHistoryIds[c.id];
            const historyList = c.history || [];

            return (
              <div
                key={c.id}
                className={`bg-white rounded-xl border transition-all overflow-hidden ${
                  isReviewed 
                    ? 'border-emerald-300 shadow-sm ring-1 ring-emerald-200' 
                    : 'border-gov-border shadow-sm hover:shadow-md'
                }`}
              >
                {/* Header Strip */}
                <div className="bg-gov-bg border-b border-gray-100 px-6 py-3.5 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-extrabold text-gov-blue text-base">
                      {c.tracking_ref}
                    </span>
                    <span className="text-xs text-gray-400">&bull;</span>
                    <span className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded">
                      {c.category || 'General Service'}
                    </span>
                    {/* Department Tag */}
                    {(c.department || c.department_code) && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                        🏢 {c.department_code ? `[${c.department_code}] ` : ''}{c.department}
                      </span>
                    )}
                    {/* Department Review Status Badge */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs bg-indigo-50 text-indigo-800 border-indigo-200">
                      {c.status === 'under_review' ? '🔍 Under Department Review' :
                       c.status === 'in_progress' ? '⚡ Action In Progress' :
                       c.status === 'assigned' ? '📌 Assigned to Officer' :
                       c.status === 'resolved' ? '✓ Resolved & Closed' :
                       c.status === 'closed' ? '✓ Case Closed' :
                       '📥 New Grievance'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getPriorityBadge(c.priority)}
                    {getStatusBadge(c.status)}
                    <SpeechStatusButton complaint={c} size="sm" variant="outline" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Complaint Content */}
                    <div className="lg:col-span-7 space-y-3">
                      <div>
                        <h3 className="text-xl font-bold text-gov-navy leading-snug">
                          {c.title}
                        </h3>
                        <p className="text-sm text-gov-text mt-1.5 whitespace-pre-wrap leading-relaxed">
                          {c.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-gov-blue" />
                          <span>{c.locality || c.address || 'Bengaluru'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-gov-blue" />
                          <span>{c.submitted_at ? format(new Date(c.submitted_at), 'MMM d, yyyy h:mm a') : 'Recently'}</span>
                        </div>
                        <div className="font-medium text-gov-navy">
                          Dept: <span className="text-gov-blue font-semibold">{c.department || 'Under Review'}</span>
                        </div>
                      </div>

                      {c.resolution_notes && (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-md text-xs text-emerald-900 mt-2">
                          <span className="font-bold">Resolution Notes: </span>
                          {c.resolution_notes}
                        </div>
                      )}

                      {/* History & Timeline Toggle Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => toggleHistory(c.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-gov-blue hover:text-blue-900 transition-colors bg-blue-50/60 hover:bg-blue-100/60 px-3 py-1.5 rounded-lg border border-blue-200"
                        >
                          <History size={14} />
                          {isHistoryExpanded ? 'Hide History & Audit Trail' : `View Complaint History (${historyList.length > 0 ? historyList.length : '1'} Lifecycle Event${historyList.length !== 1 ? 's' : ''})`}
                          {isHistoryExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Right: Submitter Contact Box (Name, Email, Number) & Actions */}
                    <div className="lg:col-span-5 bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3 border-b border-blue-100 pb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-gov-navy flex items-center gap-1.5">
                            <User size={14} className="text-gov-blue" /> Submitter Details
                          </span>
                          <span className="text-[11px] font-semibold text-gray-500">
                            {c.citizen_id ? 'Registered Citizen' : 'Public Guest Submission'}
                          </span>
                        </div>

                        {/* Explicit Submitter: Name, Email, Number */}
                        <div className="space-y-2.5 text-xs">
                          <div className="flex items-start gap-2">
                            <span className="w-16 text-gray-500 font-semibold shrink-0">Name:</span>
                            <span className="font-bold text-gov-navy break-words text-sm">{submitterName}</span>
                          </div>

                          <div className="flex items-start gap-2">
                            <span className="w-16 text-gray-500 font-semibold shrink-0 flex items-center gap-1">
                              <Mail size={12} className="text-gov-blue" /> Email:
                            </span>
                            <a 
                              href={`mailto:${submitterEmail}`}
                              className="font-medium text-gov-blue hover:underline break-all"
                            >
                              {submitterEmail}
                            </a>
                          </div>

                          <div className="flex items-start gap-2">
                            <span className="w-16 text-gray-500 font-semibold shrink-0 flex items-center gap-1">
                              <Phone size={12} className="text-gov-blue" /> Phone:
                            </span>
                            <a
                              href={`tel:${submitterPhone}`}
                              className="font-bold text-gov-navy hover:text-gov-blue"
                            >
                              {submitterPhone}
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Department Review Action Bar */}
                      <div className="mt-4 pt-3 border-t border-blue-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveModalComplaint(c);
                              setModalStatus(c.status);
                              setModalRemarks(c.resolution_notes || '');
                            }}
                            className="px-4 py-2 bg-gov-blue text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <FileText size={14} /> Update Review &amp; Department Action
                          </button>

                          {c.resolution_notes && (
                            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md font-medium">
                              📝 Notes: {c.resolution_notes.length > 35 ? `${c.resolution_notes.slice(0, 35)}...` : c.resolution_notes}
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/track?ref=${c.tracking_ref}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gov-blue hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                          title="Open in Tracker View"
                        >
                          <span>Citizen Tracker</span>
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Lifecycle History Timeline */}
                  {isHistoryExpanded && (
                    <div className="mt-6 pt-5 border-t border-gray-200 bg-gray-50/70 -mx-6 -mb-6 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <History size={16} className="text-gov-blue" />
                        <h4 className="text-xs font-extrabold text-gov-navy uppercase tracking-wider">
                          Complaint Lifecycle History &amp; Audit Trail &bull; {c.tracking_ref}
                        </h4>
                      </div>

                      <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                        {/* Event 1: Initial Submission */}
                        <div className="relative">
                          <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                          <div className="text-xs">
                            <span className="font-bold text-gov-navy">Request Filed &bull; Submitted</span>
                            <span className="text-gray-400 text-[11px] ml-2">
                              {c.submitted_at ? format(new Date(c.submitted_at), 'dd MMM yyyy, hh:mm a') : 'Initial Date'}
                            </span>
                            <p className="text-gray-600 mt-0.5">
                              Submitted by <strong>{submitterName}</strong> ({submitterEmail}) via CivicEase portal. Initial priority assigned as <span className="font-semibold uppercase text-xs">{c.priority}</span>.
                            </p>
                          </div>
                        </div>

                        {/* Event 2: Department Routing */}
                        <div className="relative">
                          <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white" />
                          <div className="text-xs">
                            <span className="font-bold text-gov-navy">Department Routed</span>
                            <p className="text-gray-600 mt-0.5">
                              Routed to <strong>{c.department || 'General Public Services'}</strong>. Standard turnaround SLA target: {c.sla_hours || 48} hours.
                            </p>
                          </div>
                        </div>

                        {/* Event 3..N: Database Status History Entries */}
                        {historyList.map((h: any, idx: number) => (
                          <div key={idx} className="relative">
                            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-white" />
                            <div className="text-xs">
                              <span className="font-bold text-gov-navy">
                                Status Changed: {(h.from_status || 'submitted').replace('_', ' ')} &rarr; <span className="text-gov-blue">{h.to_status.replace('_', ' ')}</span>
                              </span>
                              <span className="text-gray-400 text-[11px] ml-2">
                                {h.created_at ? format(new Date(h.created_at), 'dd MMM yyyy, hh:mm a') : ''}
                              </span>
                              <p className="text-gray-600 mt-0.5">
                                Updated by <strong>{h.changed_by || 'Officer'}</strong>
                                {h.remarks && (
                                  <span className="block mt-1 italic text-gray-700 bg-white p-2 rounded border border-gray-200">
                                    &ldquo;{h.remarks}&rdquo;
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        ))}

                        {/* Resolved Event if marked */}
                        {c.resolved_at && (
                          <div className="relative">
                            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-white" />
                            <div className="text-xs">
                              <span className="font-bold text-emerald-800">Resolution Completed</span>
                              <span className="text-gray-400 text-[11px] ml-2">
                                {format(new Date(c.resolved_at), 'dd MMM yyyy, hh:mm a')}
                              </span>
                              {c.resolution_notes && (
                                <p className="text-emerald-900 mt-0.5 font-medium bg-emerald-50/80 p-2 rounded border border-emerald-200">
                                  {c.resolution_notes}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Review Record in this dashboard */}
                        {isReviewed && (
                          <div className="relative">
                            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                            <div className="text-xs">
                              <span className="font-bold text-emerald-900">Verified by Review Console</span>
                              <span className="text-gray-400 text-[11px] ml-2">
                                At {reviewInfo?.reviewedAt}
                              </span>
                              <p className="text-emerald-800 mt-0.5">
                                Officer remarks: <em>{reviewInfo?.notes || 'Verified & stored in dashboard review count'}</em>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {activeModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-gov-border">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gov-navy">
                  Review Complaint #{activeModalComplaint.id}
                </h3>
                <p className="text-xs font-mono text-gov-blue font-bold">
                  {activeModalComplaint.tracking_ref}
                </p>
              </div>
              <button
                onClick={() => setActiveModalComplaint(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleModalReviewSubmit} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1">
                <p><strong>Submitter:</strong> {activeModalComplaint.submitter_name || activeModalComplaint.guest_name}</p>
                <p><strong>Email:</strong> {activeModalComplaint.submitter_email || activeModalComplaint.guest_email}</p>
                <p><strong>Phone:</strong> {activeModalComplaint.submitter_phone || activeModalComplaint.guest_phone}</p>
                <p><strong>Issue:</strong> {activeModalComplaint.title}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gov-navy uppercase mb-1">
                  Change Status
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-gov-blue outline-none"
                  required
                >
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gov-navy uppercase mb-1">
                  Reviewer Notes / Resolution Remarks
                </label>
                <textarea
                  rows={3}
                  value={modalRemarks}
                  onChange={(e) => setModalRemarks(e.target.value)}
                  placeholder="Enter investigation update, departmental action taken, or citizen response..."
                  className="w-full border rounded-md p-3 text-sm focus:ring-2 focus:ring-gov-blue outline-none"
                />
              </div>

              <div className="pt-2 flex justify-between items-center">
                <SpeechStatusButton complaint={activeModalComplaint} size="sm" variant="outline" />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalComplaint(null)}
                    className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingId === activeModalComplaint.id}
                    className="px-5 py-2 bg-gov-blue text-white rounded-md text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {updatingId === activeModalComplaint.id ? 'Saving...' : 'Save & Store Review'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewDashboard;
