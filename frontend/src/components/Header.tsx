import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { Settings, User, LogOut } from 'lucide-react';
import { CivicEaseLogo } from './CivicEaseLogo';

export function Header() {
  const { user, logout } = useAuth();
  const { language, setLanguage, setFontSize, setHighContrast, highContrast } = useAccessibility();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gov-border shadow-sm">
      {/* Top Utility Strip */}
      <div className="bg-gov-navy text-white py-1.5 px-4 text-xs md:text-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-2">
          <div>
            <span className="font-semibold">Public Service Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:bg-white focus:text-gov-navy focus:p-1">
              Skip to Main Content
            </a>
            <div className="flex items-center gap-2 border-r border-white/20 pr-4">
              <span className="sr-only">Font Size</span>
              <button onClick={() => setFontSize('normal')} className="hover:text-gov-saffron px-1">A</button>
              <button onClick={() => setFontSize('large')} className="hover:text-gov-saffron px-1 text-lg">A+</button>
              <button onClick={() => setFontSize('xlarge')} className="hover:text-gov-saffron px-1 text-xl">A++</button>
            </div>
            <button onClick={() => setHighContrast(!highContrast)} className="hover:text-gov-saffron">
              {highContrast ? 'Standard Contrast' : 'High Contrast'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="flex justify-between items-center">
          <Link to="/" className="group" aria-label="CivicEase Home">
            <CivicEaseLogo size="md" />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gov-text font-medium hover:text-gov-blue">Home</Link>
            <Link to="/submit" className="text-gov-text font-medium hover:text-gov-blue">Submit a Request</Link>
            <Link to="/track" className="text-gov-text font-medium hover:text-gov-blue">Track a Request</Link>
            <Link to="/dashboard" className="text-gov-text font-medium hover:text-gov-blue">Review Dashboard</Link>
            
            {user ? (
              <div className="flex items-center gap-4 ml-4 border-l border-gov-border pl-4">
                <Link to={user.role === 'citizen' ? '/dashboard' : '/staff'} className="flex items-center gap-2 font-medium text-gov-blue hover:text-gov-navy">
                  <User size={18} />
                  Dashboard
                </Link>
                <button onClick={logout} className="flex items-center gap-1 text-red-600 hover:text-red-800">
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-4">
                <Link to="/login" className="px-4 py-2 text-gov-blue border border-gov-blue rounded-md hover:bg-gov-blue-pale font-medium transition-colors">
                  Sign In
                </Link>
                <Link to="/submit" className="px-4 py-2 bg-gov-saffron text-white rounded-md hover:bg-orange-600 font-medium transition-colors">
                  Submit Request
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
