import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, User, AlertCircle, Loader2, ArrowRight, UserPlus, 
  Lock, Shield, KeyRound, Sparkles 
} from 'lucide-react';
import { CivicEaseLogo } from '../components/CivicEaseLogo';
import { authenticateCredentials, type AuthUserProfile } from '../data/demoUsers';
import { DEPARTMENT_OFFICERS } from './ReviewDashboard';

export function Login() {
  const [activeTab, setActiveTab] = useState<'citizen' | 'staff'>('citizen');

  // Citizen State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Staff State
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle Citizen Account Submission
  const handleCitizenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your Name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your Mail ID.');
      return;
    }

    setLoading(true);
    
    try {
      const citizenUser: AuthUserProfile = {
        id: Date.now(),
        full_name: name.trim(),
        email: email.trim().toLowerCase(),
        role: 'citizen',
      };
      
      const token = 'citizen-token-' + Date.now();
      login(token, citizenUser);
      navigate('/submit');
    } catch (err: any) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Staff / Officer Login
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!staffEmail.trim()) {
      setError('Please enter your officer email address.');
      return;
    }

    setLoading(true);

    try {
      const { token, user: staffUser } = await authenticateCredentials(
        staffEmail.trim(), 
        staffPassword || 'Staff@123'
      );
      login(token, staffUser);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Quick Demo Login for Officers
  const handleQuickOfficerLogin = async (emailToUse: string, passwordToUse = 'Staff@123') => {
    setError('');
    setLoading(true);
    try {
      const { token, user: staffUser } = await authenticateCredentials(emailToUse, passwordToUse);
      login(token, staffUser);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl border border-gov-border p-6 md:p-8 transition-all">
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <CivicEaseLogo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-gov-navy flex items-center justify-center gap-2">
            CivicEase Access Portal
          </h1>
          <p className="text-sm text-gov-text-sec mt-1">
            Sign in as a Citizen or authenticate as a Department Officer
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6 border border-gray-200">
          <button
            type="button"
            onClick={() => { setActiveTab('citizen'); setError(''); }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'citizen'
                ? 'bg-white text-gov-navy shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <UserPlus size={16} className={activeTab === 'citizen' ? 'text-gov-blue' : ''} />
            <span>Citizen Account</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('staff'); setError(''); }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'staff'
                ? 'bg-white text-gov-navy shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield size={16} className={activeTab === 'staff' ? 'text-gov-blue' : ''} />
            <span>Staff &amp; Officers</span>
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2 rounded-lg animate-fade-in">
            <AlertCircle className="shrink-0 mt-0.5" size={16} />
            <p>{error}</p>
          </div>
        )}
        
        {/* CITIZEN TAB */}
        {activeTab === 'citizen' && (
          <form onSubmit={handleCitizenSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gov-navy mb-1.5" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  id="name"
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-2.5 border border-gov-border rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-gov-blue outline-none text-sm transition-all"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gov-navy mb-1.5" htmlFor="email">
                Mail ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email ID (e.g. name@gmail.com)"
                  className="w-full pl-10 pr-4 py-2.5 border border-gov-border rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-gov-blue outline-none text-sm transition-all"
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-gov-blue text-white rounded-lg font-bold text-sm hover:bg-gov-navy transition-all duration-200 disabled:opacity-70 flex justify-center items-center gap-2 shadow-sm hover:shadow mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Continue to Public Services</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="text-center text-xs text-gray-500 pt-2">
              No password needed. Simply provide your Name and Mail ID for instant citizen access.
            </div>
          </form>
        )}

        {/* STAFF & OFFICER TAB */}
        {activeTab === 'staff' && (
          <div className="space-y-5">
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gov-navy mb-1.5" htmlFor="staff-email">
                  Officer / Staff Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    id="staff-email"
                    type="email" 
                    value={staffEmail}
                    onChange={e => setStaffEmail(e.target.value)}
                    placeholder="e.g. staff.elec@civicease.demo"
                    className="w-full pl-10 pr-4 py-2.5 border border-gov-border rounded-lg focus:ring-2 focus:ring-gov-blue outline-none text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gov-navy mb-1.5" htmlFor="staff-password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    id="staff-password"
                    type="password" 
                    value={staffPassword}
                    onChange={e => setStaffPassword(e.target.value)}
                    placeholder="•••••••• (Default: Staff@123)"
                    className="w-full pl-10 pr-4 py-2.5 border border-gov-border rounded-lg focus:ring-2 focus:ring-gov-blue outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-gov-navy text-white rounded-lg font-bold text-sm hover:bg-gov-blue transition-all duration-200 disabled:opacity-70 flex justify-center items-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={16} />
                    <span>Sign In &amp; Open Review Dashboard</span>
                  </>
                )}
              </button>
            </form>

            {/* 1-Click Demo Buttons for All 8 Officers */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gov-navy uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={14} className="text-gov-saffron" /> 1-Click Officer Logins
                </span>
                <span className="text-[11px] text-gray-500 font-mono">Password: Staff@123</span>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {DEPARTMENT_OFFICERS.map(dept => (
                  <button
                    key={dept.code}
                    type="button"
                    onClick={() => handleQuickOfficerLogin(dept.email, 'Staff@123')}
                    className={`text-left p-2 rounded-lg border text-xs transition-all flex items-center gap-2 ${dept.color}`}
                  >
                    <span className="text-base">{dept.icon}</span>
                    <div className="min-w-0">
                      <div className="font-bold truncate">{dept.officerName}</div>
                      <div className="text-[10px] opacity-80 truncate">{dept.code}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleQuickOfficerLogin('admin@civicease.demo', 'Admin@123')}
                  className="text-left p-2 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <span>🛡️</span>
                  <div className="min-w-0">
                    <div className="truncate">Administrator</div>
                    <div className="text-[10px] text-purple-700 font-normal">All Departments</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickOfficerLogin('supervisor@civicease.demo', 'Super@123')}
                  className="text-left p-2 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <span>⭐</span>
                  <div className="min-w-0">
                    <div className="truncate">Supervisor Singh</div>
                    <div className="text-[10px] text-amber-700 font-normal">Escalations</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
