import React, { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.access_token, res.data.user);
      
      if (res.data.user.role === 'citizen') {
        navigate('/submit');
      } else {
        navigate('/staff');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-xl shadow-md border border-gov-border p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gov-blue rounded-full flex items-center justify-center text-white mx-auto mb-4">
            <span className="font-bold">CE</span>
          </div>
          <h1 className="text-2xl font-bold text-gov-navy">Sign In</h1>
          <p className="text-sm text-gov-text-sec mt-1">Access your CivicEase account</p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2 rounded">
            <AlertCircle className="shrink-0 mt-0.5" size={16} />
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gov-navy mb-1" htmlFor="email">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                id="email"
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gov-border rounded focus:ring-2 focus:ring-gov-blue outline-none"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gov-navy mb-1" htmlFor="password">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                id="password"
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gov-border rounded focus:ring-2 focus:ring-gov-blue outline-none"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 bg-gov-blue text-white rounded font-medium hover:bg-blue-800 transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            Sign In
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100">
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">8 Department Officers (1-Click Fill)</h3>
           <p className="text-[11px] text-gray-500 mb-3">Click any officer to autofill credentials:</p>
           <div className="grid grid-cols-2 gap-1.5 text-xs">
             <button type="button" onClick={() => { setEmail('staff.pwd@civicease.demo'); setPassword('Staff@123'); }} className="text-left p-1.5 bg-gray-50 hover:bg-blue-50 border rounded text-[11px]">
               <strong>PWD:</strong> Suresh Kumar
             </button>
             <button type="button" onClick={() => { setEmail('staff.elec@civicease.demo'); setPassword('Staff@123'); }} className="text-left p-1.5 bg-gray-50 hover:bg-blue-50 border rounded text-[11px]">
               <strong>Electrical:</strong> Priya Sharma
             </button>
             <button type="button" onClick={() => { setEmail('staff.water@civicease.demo'); setPassword('Staff@123'); }} className="text-left p-1.5 bg-gray-50 hover:bg-blue-50 border rounded text-[11px]">
               <strong>Water:</strong> Rajan Pillai
             </button>
             <button type="button" onClick={() => { setEmail('staff.sanit@civicease.demo'); setPassword('Staff@123'); }} className="text-left p-1.5 bg-gray-50 hover:bg-blue-50 border rounded text-[11px]">
               <strong>Sanitation:</strong> Kavitha Nair
             </button>
             <button type="button" onClick={() => { setEmail('staff.drain@civicease.demo'); setPassword('Staff@123'); }} className="text-left p-1.5 bg-gray-50 hover:bg-blue-50 border rounded text-[11px]">
               <strong>Drainage:</strong> Mohammed Ali
             </button>
             <button type="button" onClick={() => { setEmail('staff.parks@civicease.demo'); setPassword('Staff@123'); }} className="text-left p-1.5 bg-gray-50 hover:bg-blue-50 border rounded text-[11px]">
               <strong>Parks:</strong> Anita Desai
             </button>
             <button type="button" onClick={() => { setEmail('staff.safety@civicease.demo'); setPassword('Staff@123'); }} className="text-left p-1.5 bg-gray-50 hover:bg-blue-50 border rounded text-[11px]">
               <strong>Safety:</strong> Vikram Singh
             </button>
             <button type="button" onClick={() => { setEmail('staff.gen@civicease.demo'); setPassword('Staff@123'); }} className="text-left p-1.5 bg-gray-50 hover:bg-blue-50 border rounded text-[11px]">
               <strong>General:</strong> Lakshmi Rao
             </button>
             <button type="button" onClick={() => { setEmail('admin@civicease.demo'); setPassword('Admin@123'); }} className="text-left p-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded text-[11px] col-span-2 text-purple-900 font-semibold">
               <strong>Admin:</strong> System Administrator (admin@civicease.demo)
             </button>
           </div>
           <div className="mt-2 text-[10px] text-gray-500 text-center">
             Password: <span className="font-mono text-gov-navy font-bold">Staff@123</span> / <span className="font-mono text-gov-navy font-bold">Admin@123</span>
           </div>
        </div>
      </div>
    </div>
  );
}
