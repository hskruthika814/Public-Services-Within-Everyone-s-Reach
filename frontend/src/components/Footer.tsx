import React from 'react';
import { Link } from 'react-router-dom';
import { CivicEaseLogo } from './CivicEaseLogo';

export function Footer() {
  return (
    <footer className="bg-gov-navy text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-white/20 pb-8">
          <div className="col-span-1 md:col-span-1">
            <CivicEaseLogo size="md" variant="light" className="mb-4" />
            <p className="text-sm text-gray-300">
              Designed to make public services more accessible, transparent, and citizen-friendly.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-gov-saffron">Services</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/submit" className="hover:text-white transition-colors">Submit a Request</Link></li>
              <li><Link to="/track" className="hover:text-white transition-colors">Track a Request</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Complaint Tracker Dashboard</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Public Services List</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-gov-saffron">Information</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/about" className="hover:text-white transition-colors">About the Portal</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/accessibility" className="hover:text-white transition-colors">Accessibility Statement</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-gov-saffron">Legal & Support</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Help and Support</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="text-center text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} CivicEase. All rights reserved. Public Service &amp; Grievance Redressal Portal.</p>
        </div>
      </div>
    </footer>
  );
}
