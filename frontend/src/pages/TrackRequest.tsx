import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { Search, MapPin, Clock, AlertCircle, CheckCircle, ShieldAlert, CheckCircle2, ChevronRight, FileText, User, Mail, Phone, Volume2 } from 'lucide-react';
import { format } from 'date-fns';
import { SpeechStatusButton } from '../components/SpeechStatusButton';
import { SpeechInputButton } from '../components/SpeechInputButton';

export function TrackRequest() {
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  
  const [trackingRef, setTrackingRef] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [complaint, setComplaint] = useState<any>(null);

  useEffect(() => {
    if (initialRef) handleSearch();
  }, [initialRef]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trackingRef.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/complaints/track/${trackingRef.trim()}`);
      setComplaint(res.data.complaint);
    } catch (err: any) {
      // Check local storage for complaints submitted on GitHub Pages
      try {
        const localComplaints = JSON.parse(localStorage.getItem('civicease_local_complaints') || '[]');
        const found = localComplaints.find((c: any) => c.tracking_ref?.toUpperCase() === trackingRef.trim().toUpperCase());
        if (found) {
          setComplaint(found);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error(e);
      }
      setError(err.response?.data?.message || 'Complaint not found. Please check your reference number.');
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'in_progress': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'escalated': return 'bg-red-100 text-red-800 border-red-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gov-navy mb-2">Track Your Service Request</h1>
        <p className="text-gov-text-sec">Enter your tracking reference to view the real-time status of your complaint.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gov-border p-6 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <div className="flex-grow relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              value={trackingRef}
              onChange={(e) => setTrackingRef(e.target.value)}
              placeholder="e.g. CIV-2026-DEMO01"
              className="w-full pl-10 pr-24 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gov-blue outline-none uppercase font-mono"
              required
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <SpeechInputButton 
                label="Voice" 
                size="sm" 
                mode="replace"
                onTranscript={(text) => {
                  const cleaned = text.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '');
                  setTrackingRef(cleaned);
                }} 
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-3 bg-gov-blue text-white rounded-md font-medium hover:bg-blue-800 transition-colors disabled:opacity-70 whitespace-nowrap"
          >
            {loading ? 'Searching...' : 'Track Request'}
          </button>
        </form>
        {error && <p className="text-red-600 text-center mt-4 text-sm font-medium">{error}</p>}
      </div>

      {complaint && (
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gov-border overflow-hidden">
              <div className="border-b border-gray-100 p-6 bg-gov-bg flex flex-wrap justify-between items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tracking Reference</span>
                  </div>
                  <h2 className="text-2xl font-mono font-bold text-gov-navy">{complaint.tracking_ref}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <SpeechStatusButton complaint={complaint} size="md" variant="primary" />
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(complaint.status)}`}>
                    {complaint.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gov-navy mb-4">{complaint.title}</h3>
                <p className="text-gov-text mb-6 whitespace-pre-wrap">{complaint.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-start gap-3">
                    <FileText className="text-gov-blue shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Category</p>
                      <p className="font-medium text-sm">{complaint.category}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="text-gov-blue shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Location</p>
                      <p className="font-medium text-sm">{complaint.locality}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="text-gov-blue shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Submitted</p>
                      <p className="font-medium text-sm">{format(new Date(complaint.submitted_at), 'MMM d, yyyy h:mm a')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldAlert className={`${complaint.priority === 'critical' ? 'text-red-500' : 'text-gov-saffron'} shrink-0 mt-0.5`} size={18} />
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Priority</p>
                      <p className={`font-medium text-sm capitalize ${complaint.priority === 'critical' ? 'text-red-600' : ''}`}>
                        {complaint.priority}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submitter Contact Information */}
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Registered Submitter Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-blue-50/60 p-3.5 rounded-lg border border-blue-100 text-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-gov-blue shrink-0">
                        <User size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] text-gray-500 font-semibold block uppercase">Name</span>
                        <span className="font-bold text-gov-navy truncate block">
                          {complaint.submitter_name || complaint.citizen_name || complaint.guest_name || 'Citizen'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-gov-blue shrink-0">
                        <Mail size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] text-gray-500 font-semibold block uppercase">Email</span>
                        <span className="font-medium text-gray-800 truncate block">
                          {complaint.submitter_email || complaint.citizen_email || complaint.guest_email || 'Not provided'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-gov-blue shrink-0">
                        <Phone size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] text-gray-500 font-semibold block uppercase">Phone Number</span>
                        <span className="font-medium text-gray-800 truncate block">
                          {complaint.submitter_phone || complaint.citizen_phone || complaint.guest_phone || 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {complaint.status === 'resolved' && complaint.resolution_notes && (
                <div className="p-6 bg-green-50 border-t border-green-100">
                  <h4 className="flex items-center gap-2 font-bold text-green-800 mb-2">
                    <CheckCircle size={18} /> Resolution Details
                  </h4>
                  <p className="text-green-900 text-sm">{complaint.resolution_notes}</p>
                  <p className="text-xs text-green-700 mt-2">Resolved on: {format(new Date(complaint.resolved_at), 'MMM d, yyyy')}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar / Timeline */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gov-border p-6">
              <h3 className="font-bold text-gov-navy mb-4 border-b pb-2">Department Assignment</h3>
              <p className="text-sm font-medium mb-1">Responsible Department:</p>
              <p className="text-gov-blue font-bold mb-4">{complaint.department || 'Awaiting Assignment'}</p>
              {complaint.assigned_staff && (
                <>
                  <p className="text-sm font-medium mb-1">Handling Officer:</p>
                  <p className="text-gray-700">{complaint.assigned_staff}</p>
                </>
              )}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gov-border p-6">
              <h3 className="font-bold text-gov-navy mb-6">Status History</h3>
              <div className="space-y-6">
                {complaint.history?.map((hist: any, i: number) => (
                  <div key={hist.id} className="relative pl-6 border-l-2 border-gray-200 last:border-l-0 last:pb-0 pb-2">
                    <div className="absolute w-3 h-3 bg-gov-blue rounded-full -left-[7px] top-1"></div>
                    <div className="-mt-1.5">
                      <p className="text-xs text-gray-500 mb-1">{format(new Date(hist.created_at), 'MMM d, h:mm a')}</p>
                      <p className="font-bold text-sm uppercase text-gov-navy mb-1">{hist.to_status.replace('_', ' ')}</p>
                      {hist.remarks && <p className="text-sm text-gray-600">{hist.remarks}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
