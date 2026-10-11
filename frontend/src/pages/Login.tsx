import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, User, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { CivicEaseLogo } from '../components/CivicEaseLogo';

export function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your Gmail / email address.');
      return;
    }

    setLoading(true);
    
    try {
      // Create user session with Name and Gmail
      const user = {
        id: Date.now(),
        full_name: name.trim(),
        email: email.trim(),
        role: 'citizen',
      };
      
      const token = 'citizen-token-' + Date.now();
      login(token, user);
      
      // Navigate to submit page or dashboard
      navigate('/submit');
    } catch (err: any) {
      setError('Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl shadow-lg border border-gov-border p-8 transition-all">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <CivicEaseLogo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-gov-navy">Sign In</h1>
          <p className="text-sm text-gov-text-sec mt-1">
            Enter your Name and Gmail to access CivicEase
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2 rounded-lg">
            <AlertCircle className="shrink-0 mt-0.5" size={16} />
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
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
                placeholder="e.g. Kruthika H S"
                className="w-full pl-10 pr-4 py-2.5 border border-gov-border rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-gov-blue outline-none text-sm transition-all"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Gmail / Email Field */}
          <div>
            <label className="block text-sm font-bold text-gov-navy mb-1.5" htmlFor="email">
              Gmail / Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                id="email"
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. name@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gov-border rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-gov-blue outline-none text-sm transition-all"
                required
              />
            </div>
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-gov-blue text-white rounded-lg font-bold text-sm hover:bg-gov-navy transition-all duration-200 disabled:opacity-70 flex justify-center items-center gap-2 shadow-sm hover:shadow"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Signing In...
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          No password needed. Simply sign in with your Name and Gmail.
        </div>
      </div>
    </div>
  );
}
