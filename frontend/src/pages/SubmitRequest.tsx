import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import { 
  AlertCircle, CheckCircle2, ArrowRight, Loader2, MapPin, Volume2, 
  RefreshCw, Road, Zap, Droplets, Trash2, Waves, Trees, AlertTriangle, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SpeechStatusButton } from '../components/SpeechStatusButton';
import { SpeechInputButton } from '../components/SpeechInputButton';

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  ROADS:    { icon: <Road size={22} />,          color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
  LIGHTS:   { icon: <Zap size={22} />,           color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  WATER:    { icon: <Droplets size={22} />,      color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200' },
  GARBAGE:  { icon: <Trash2 size={22} />,        color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  DRAINAGE: { icon: <Waves size={22} />,         color: 'text-cyan-700',   bg: 'bg-cyan-50 border-cyan-200' },
  PARKS:    { icon: <Trees size={22} />,         color: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200' },
  SAFETY:   { icon: <AlertTriangle size={22} />, color: 'text-red-600',    bg: 'bg-red-50 border-red-200' },
  OTHER:    { icon: <FileText size={22} />,      color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
};

export function SubmitRequest() {
  const [searchParams] = useSearchParams();
  const initialCategoryId = searchParams.get('category');
  
  const { user } = useAuth();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    category_id: initialCategoryId || '',
    title: '',
    description: '',
    address: '',
    locality: '',
    guest_name: '',
    guest_email: '',
    guest_phone: '',
  });
  
  // Result state
  const [result, setResult] = useState<any>(null);

  const fetchCategories = useCallback(async () => {
    setCatLoading(true);
    setCatError(false);
    try {
      const res = await api.get('/public/categories');
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Failed to load categories', err);
      setCatError(true);
    } finally {
      setCatLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    setError(null);
    if (step === 1 && !formData.category_id) return setError('Please select a service category to continue.');
    if (step === 2 && (!formData.title || !formData.description)) return setError('Title and description are required');
    if (step === 3 && !formData.locality) return setError('Locality is required');
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const submitForm = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = { ...formData };
      if (user) {
        payload.guest_name = '';
        payload.guest_email = '';
        payload.guest_phone = '';
      } else if (!payload.guest_name || !payload.guest_email) {
        setError("Name and Email are required for guest submissions.");
        setLoading(false);
        return;
      }

      const res = await api.post('/complaints/', payload);
      setResult(res.data);
      setStep(5);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 5 && result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl border border-gov-border shadow-sm p-8 text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-gov-green" />
          </div>
          <h2 className="text-3xl font-bold text-gov-navy mb-2">Request Submitted Successfully</h2>
          <p className="text-gov-text-sec mb-8">Your public service request has been received and routed.</p>
          
          <div className="bg-gov-bg p-6 rounded-lg border border-gov-border mb-8 max-w-md mx-auto">
            <p className="text-sm text-gray-500 mb-1">Your Tracking Reference:</p>
            <p className="text-3xl font-mono font-bold text-gov-blue tracking-wider">{result.tracking_ref}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-left max-w-lg mx-auto mb-8 bg-white border border-gov-border rounded-lg p-4 shadow-sm">
             <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Assigned Dept</p>
                <p className="font-medium text-gov-navy">{result.complaint.department || 'Under Review'}</p>
             </div>
             <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Priority</p>
                <p className={`font-medium capitalize ${result.complaint.priority === 'critical' ? 'text-red-600' : 'text-gov-saffron'}`}>
                  {result.complaint.priority}
                </p>
             </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-8 max-w-xl mx-auto">
             Please save your tracking reference. You can use it to check the status of your request at any time.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
            <SpeechStatusButton complaint={result.complaint} size="lg" variant="primary" />
            <Link to={`/track?ref=${result.tracking_ref}`} className="px-6 py-2.5 bg-gov-blue-pale text-gov-navy border border-gov-border rounded-md font-medium hover:bg-blue-100 transition-colors">
              Track Request
            </Link>
            <Link to="/" className="px-6 py-2.5 border border-gov-border text-gov-text rounded-md font-medium hover:bg-gray-50 transition-colors">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gov-navy mb-2">Submit a Service Request</h1>
      <p className="text-gov-text-sec mb-8">Follow the steps below to report an issue.</p>
      
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
        <div className="absolute top-1/2 left-0 h-1 bg-gov-blue -translate-y-1/2 z-0 transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
        
        {[
          { num: 1, label: 'Category' },
          { num: 2, label: 'Details' },
          { num: 3, label: 'Location' },
          { num: 4, label: 'Review' }
        ].map(s => (
          <div key={s.num} className="relative z-10 flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              step === s.num ? 'bg-gov-blue text-white ring-4 ring-blue-100' : 
              step > s.num ? 'bg-gov-blue text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step > s.num ? <CheckCircle2 size={20} /> : s.num}
            </div>
            <span className="text-[10px] font-semibold text-gray-500 hidden sm:block">{s.label}</span>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-xl border border-gov-border shadow-sm p-6 md:p-8 relative">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-3 rounded-r-lg">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Step 1: Category */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-1">Select Service Category</h2>
            <p className="text-sm text-gov-text-sec mb-6">Choose the department that best matches your issue.</p>

            {/* Loading State */}
            {catLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 size={36} className="animate-spin text-gov-blue" />
                <p className="text-gov-text-sec text-sm font-medium">Loading service categories...</p>
              </div>
            )}

            {/* Error State */}
            {!catLoading && catError && (
              <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle size={28} className="text-red-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 mb-1">Unable to load service categories</p>
                  <p className="text-sm text-gray-500">Please check your connection and try again.</p>
                </div>
                <button
                  onClick={fetchCategories}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gov-blue text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
                >
                  <RefreshCw size={16} /> Retry
                </button>
              </div>
            )}

            {/* Categories Grid */}
            {!catLoading && !catError && categories.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map(cat => {
                  const iconData = CATEGORY_ICONS[cat.code] || CATEGORY_ICONS['OTHER'];
                  const isSelected = formData.category_id == cat.id;
                  return (
                    <label key={cat.id} className={`
                      border-2 rounded-xl p-4 cursor-pointer transition-all flex items-start gap-4
                      ${isSelected 
                        ? 'border-gov-blue bg-blue-50 shadow-md ring-2 ring-gov-blue/20' 
                        : 'border-gray-200 hover:border-gov-blue/50 hover:shadow-sm bg-white'
                      }
                    `}>
                      <input 
                        type="radio" 
                        name="category_id" 
                        value={cat.id} 
                        checked={isSelected}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${iconData.bg} ${iconData.color}`}>
                        {iconData.icon}
                      </div>
                      <div className="min-w-0">
                        <span className={`font-bold text-sm block mb-0.5 ${isSelected ? 'text-gov-blue' : 'text-gov-navy'}`}>
                          {cat.name}
                        </span>
                        <span className="text-xs text-gray-500 leading-relaxed">{cat.description}</span>
                        {cat.default_priority === 'critical' && (
                          <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                            ⚡ Priority Response
                          </span>
                        )}
                        {cat.default_priority === 'high' && (
                          <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                            🔺 High Priority
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={20} className="text-gov-blue shrink-0 mt-0.5 ml-auto" />
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!catLoading && !catError && categories.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-3">No categories available.</p>
                <button onClick={fetchCategories} className="text-gov-blue underline text-sm">Reload</button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Description */}
        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Describe the Issue</h2>
              {(() => {
                const selected = categories.find(c => c.id == formData.category_id);
                const iconData = selected ? (CATEGORY_ICONS[selected.code] || CATEGORY_ICONS['OTHER']) : null;
                return selected ? (
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium mb-4 ${iconData?.bg} ${iconData?.color}`}>
                    {iconData?.icon}
                    <span>{selected.name}</span>
                  </div>
                ) : null;
              })()}
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="title" className="block text-sm font-bold text-gov-navy">Issue Title (Short Summary) *</label>
                <SpeechInputButton 
                  label="Speak Title" 
                  size="sm"
                  currentValue={formData.title}
                  onTranscript={(text) => setFormData(f => ({ ...f, title: text }))} 
                />
              </div>
              <input 
                type="text" 
                id="title" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange}
                className="w-full border border-gov-border rounded-md px-4 py-2.5 focus:ring-2 focus:ring-gov-blue outline-none transition-all"
                placeholder="e.g., Large pothole on Main Street"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="description" className="block text-sm font-bold text-gov-navy">Detailed Description *</label>
                <SpeechInputButton 
                  label="Dictate Description" 
                  size="sm"
                  currentValue={formData.description}
                  onTranscript={(text) => setFormData(f => ({ ...f, description: text }))} 
                />
              </div>
              <textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange}
                rows={5}
                className="w-full border border-gov-border rounded-md px-4 py-2.5 focus:ring-2 focus:ring-gov-blue outline-none resize-y transition-all"
                placeholder="Please describe the issue in detail, including any specific hazards..."
                required
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">Provide clear details to help the department understand the problem and its urgency. You can also click Dictate Description to speak your issue aloud.</p>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-xl font-bold mb-2">Location Details</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-blue-800 text-sm">
               <MapPin className="shrink-0 mt-0.5" size={20} />
               <p>Providing accurate location details helps staff find and resolve the issue faster.</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="locality" className="block text-sm font-bold text-gov-navy">Locality / Area / Ward *</label>
                <SpeechInputButton 
                  label="Speak Locality" 
                  size="sm"
                  currentValue={formData.locality}
                  onTranscript={(text) => setFormData(f => ({ ...f, locality: text }))} 
                />
              </div>
              <input 
                type="text" 
                id="locality" 
                name="locality" 
                value={formData.locality} 
                onChange={handleInputChange}
                className="w-full border border-gov-border rounded-md px-4 py-2.5 focus:ring-2 focus:ring-gov-blue outline-none transition-all"
                placeholder="e.g., Rajajinagar 2nd Block"
                required
              />
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-bold text-gov-navy mb-1">Complete Address / Street Name</label>
              <textarea 
                id="address" 
                name="address" 
                value={formData.address} 
                onChange={handleInputChange}
                rows={2}
                className="w-full border border-gov-border rounded-md px-4 py-2.5 focus:ring-2 focus:ring-gov-blue outline-none transition-all"
                placeholder="e.g., 5th Cross Road, near Apollo Pharmacy"
              ></textarea>
            </div>
          </div>
        )}

        {/* Step 4: Review & Identity */}
        {step === 4 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-xl font-bold mb-4">Review and Submit</h2>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
               <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                  {(() => {
                    const selected = categories.find(c => c.id == formData.category_id);
                    const iconData = selected ? (CATEGORY_ICONS[selected.code] || CATEGORY_ICONS['OTHER']) : null;
                    return selected ? (
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${iconData?.bg} ${iconData?.color}`}>
                        {iconData?.icon}
                      </div>
                    ) : null;
                  })()}
                  <div>
                    <h4 className="text-xs uppercase text-gray-500 font-bold mb-0.5">Category</h4>
                    <p className="font-semibold text-gov-navy">{categories.find(c => c.id == formData.category_id)?.name}</p>
                  </div>
               </div>
               <div>
                  <h4 className="text-xs uppercase text-gray-500 font-bold mb-1">Issue</h4>
                  <p className="font-medium text-gov-navy">{formData.title}</p>
                  <p className="text-sm mt-1 text-gray-600">{formData.description}</p>
               </div>
               <div>
                  <h4 className="text-xs uppercase text-gray-500 font-bold mb-1">Location</h4>
                  <p className="text-sm font-medium">{formData.locality}</p>
                  <p className="text-sm text-gray-600">{formData.address}</p>
               </div>
            </div>
            
            {!user && (
              <div className="border border-gray-200 rounded-xl p-5 bg-white">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-gov-navy">
                  <span className="w-6 h-6 bg-gov-blue rounded-full text-white text-xs flex items-center justify-center font-bold">i</span>
                  Your Contact Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-bold text-gov-navy mb-1">Full Name *</label>
                     <input type="text" name="guest_name" value={formData.guest_name} onChange={handleInputChange} className="w-full border border-gov-border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-gov-blue transition-all" required />
                   </div>
                   <div>
                     <label className="block text-sm font-bold text-gov-navy mb-1">Email Address *</label>
                     <input type="email" name="guest_email" value={formData.guest_email} onChange={handleInputChange} className="w-full border border-gov-border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-gov-blue transition-all" required />
                   </div>
                   <div className="sm:col-span-2">
                     <label className="block text-sm font-bold text-gov-navy mb-1">Phone Number (Optional)</label>
                     <input type="tel" name="guest_phone" value={formData.guest_phone} onChange={handleInputChange} className="w-full border border-gov-border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-gov-blue transition-all" />
                   </div>
                </div>
              </div>
            )}
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-sm text-yellow-800">
               By submitting this request, you confirm that the provided information is accurate to the best of your knowledge.
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button 
            type="button" 
            onClick={prevStep}
            disabled={step === 1 || loading}
            className={`px-5 py-2.5 font-medium rounded-lg transition-colors ${step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gov-navy hover:bg-gray-100 border border-gray-200'}`}
          >
            ← Back
          </button>
          
          {step < 4 ? (
            <button 
              type="button" 
              onClick={nextStep}
              disabled={step === 1 && catLoading}
              className="px-6 py-2.5 bg-gov-blue text-white rounded-lg font-medium hover:bg-blue-800 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button 
              type="button" 
              onClick={submitForm}
              disabled={loading}
              className="px-8 py-2.5 bg-gov-saffron text-white rounded-lg font-bold hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
            >
              {loading ? <><Loader2 className="animate-spin" size={16} /> Processing...</> : 'Submit Request →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
