import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Filter, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function StaffDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  
  // Status update state
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/complaints');
      setComplaints(res.data.complaints);
    } catch (err) {
      console.error("Failed to fetch complaints", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !newStatus) return;
    
    setUpdating(true);
    try {
      await api.put(`/staff/complaints/${selectedComplaint.id}/status`, {
        status: newStatus,
        remarks
      });
      // Refresh list
      await fetchComplaints();
      setSelectedComplaint(null);
      setNewStatus('');
      setRemarks('');
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'open') return ['submitted', 'under_review', 'assigned'].includes(c.status);
    if (filter === 'active') return ['in_progress', 'escalated'].includes(c.status);
    if (filter === 'resolved') return ['resolved', 'closed', 'rejected'].includes(c.status);
    return true;
  });

  const getStatusColor = (status: string) => {
    if (['resolved', 'closed'].includes(status)) return 'bg-green-100 text-green-800';
    if (status === 'escalated') return 'bg-red-100 text-red-800';
    if (status === 'in_progress') return 'bg-indigo-100 text-indigo-800';
    return 'bg-blue-100 text-blue-800';
  };

  if (loading && complaints.length === 0) {
    return <div className="p-12 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gov-navy">Department Dashboard</h1>
          <p className="text-gov-text-sec">Welcome, {user?.full_name} ({user?.department || 'Admin'})</p>
        </div>
        
        <div className="flex bg-white rounded-lg border border-gov-border p-1 shadow-sm">
          <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-sm font-medium rounded-md ${filter === 'all' ? 'bg-gov-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}>All</button>
          <button onClick={() => setFilter('open')} className={`px-4 py-1.5 text-sm font-medium rounded-md ${filter === 'open' ? 'bg-gov-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}>New / Open</button>
          <button onClick={() => setFilter('active')} className={`px-4 py-1.5 text-sm font-medium rounded-md ${filter === 'active' ? 'bg-gov-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}>In Progress</button>
          <button onClick={() => setFilter('resolved')} className={`px-4 py-1.5 text-sm font-medium rounded-md ${filter === 'resolved' ? 'bg-gov-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Resolved</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gov-border overflow-hidden flex flex-col h-[70vh]">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center font-bold text-gov-navy">
            <span>Requests ({filteredComplaints.length})</span>
            <Filter size={18} className="text-gray-400" />
          </div>
          
          <div className="overflow-y-auto flex-grow p-0">
            {filteredComplaints.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No requests found for this filter.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredComplaints.map(c => (
                  <li 
                    key={c.id} 
                    onClick={() => { setSelectedComplaint(c); setNewStatus(c.status); }}
                    className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors ${selectedComplaint?.id === c.id ? 'bg-blue-50 border-l-4 border-gov-blue' : 'border-l-4 border-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-xs font-bold text-gray-500">{c.tracking_ref}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${getStatusColor(c.status)}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="font-bold text-gov-navy truncate">{c.title}</h3>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock size={12} /> {format(new Date(c.submitted_at), 'MMM d')}</span>
                      <span className={`flex items-center gap-1 capitalize font-bold ${c.priority === 'critical' ? 'text-red-600' : ''}`}>
                        {c.priority === 'critical' && <AlertTriangle size={12} />}
                        {c.priority}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gov-border flex flex-col h-[70vh] overflow-y-auto">
          {selectedComplaint ? (
            <div className="p-6">
              <div className="flex justify-between items-start mb-4 pb-4 border-b">
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Request Details</p>
                  <h2 className="text-xl font-bold text-gov-navy">{selectedComplaint.tracking_ref}</h2>
                </div>
                <Link to={`/track?ref=${selectedComplaint.tracking_ref}`} target="_blank" className="text-sm text-gov-blue hover:underline">View Timeline</Link>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-bold text-gov-navy">{selectedComplaint.title}</h3>
                  <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-3 rounded border">{selectedComplaint.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 font-bold block">Category</span>
                    <span>{selectedComplaint.category}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-bold block">Location</span>
                    <span>{selectedComplaint.locality}</span>
                  </div>
                  <div className="col-span-2">
                     <span className="text-xs text-red-500 font-bold block">Priority Reason</span>
                     <span className="italic">{selectedComplaint.priority_reason}</span>
                  </div>
                </div>
              </div>

              {/* Action Form */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gov-navy mb-3 text-sm">Update Status</h3>
                <form onSubmit={handleStatusUpdate} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">New Status</label>
                    <select 
                      value={newStatus} 
                      onChange={e => setNewStatus(e.target.value)}
                      className="w-full border rounded p-2 text-sm bg-white"
                    >
                      <option value="assigned">Assigned / Acknowledged</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Remarks / Resolution Notes <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      required
                      rows={3}
                      className="w-full border rounded p-2 text-sm bg-white resize-y"
                      placeholder="Enter update details or resolution action taken..."
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={updating}
                    className="w-full py-2 bg-gov-blue text-white rounded font-medium text-sm hover:bg-blue-800 disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {updating ? 'Updating...' : <><CheckCircle size={16} /> Save Update</>}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-gray-400 p-8 text-center">
              Select a request from the list to view details and take action.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
