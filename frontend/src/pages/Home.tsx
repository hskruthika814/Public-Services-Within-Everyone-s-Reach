import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, FileText, CheckCircle2, Shield, Settings2, ShieldCheck, MapPin } from 'lucide-react';
import { api } from '../api';

export function Home() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.get('/public/categories').then(res => setCategories(res.data.categories)).catch(console.error);
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-20 text-center">
        <div className="space-y-6 animate-fade-in flex flex-col items-center">
          <div className="inline-block px-3 py-1 bg-gov-saffron-light text-gov-saffron border border-gov-saffron/30 rounded-full text-xs font-bold tracking-wider uppercase">
            Accessible Digital Public Services
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gov-navy leading-tight max-w-4xl">
            Public Services, <br/>Within Everyone's Reach
          </h1>
          <p className="text-xl font-semibold text-gov-text-sec max-w-2xl">
            One Accessible Portal. Better Public Services.
          </p>
          <p className="text-gov-text text-base md:text-lg max-w-2xl">
            Submit public-service requests, reach the appropriate department, and track every step toward resolution through one simple, inclusive digital platform.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link to="/submit" className="px-6 py-3.5 bg-gov-blue text-white rounded-lg hover:bg-blue-800 font-bold transition-all shadow-md flex items-center gap-2 text-base">
              Submit a Service Request <ArrowRight size={18} />
            </Link>
            <Link to="/track" className="px-6 py-3.5 bg-white text-gov-blue border border-gov-border rounded-lg hover:bg-gov-blue-pale font-bold transition-all shadow-sm flex items-center gap-2 text-base">
              <Search size={18} /> Track My Request
            </Link>
            <Link to="/dashboard" className="px-6 py-3.5 bg-gov-navy text-white rounded-lg hover:bg-slate-800 font-bold transition-all shadow-md flex items-center gap-2 text-base">
              <ShieldCheck size={18} className="text-gov-saffron" /> Officer Dashboard
            </Link>
          </div>
          
          <div className="pt-2">
            <Link to="/services" className="text-gov-blue hover:underline font-medium text-sm">
              Explore All 8 Department Citizen Services &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Strip */}
      <section className="bg-white border-y border-gov-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-gov-blue-pale text-gov-blue rounded-full"><Settings2 size={24} /></div>
              <h3 className="font-bold text-sm">Accessible Interface</h3>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-gov-blue-pale text-gov-blue rounded-full"><ArrowRight size={24} /></div>
              <h3 className="font-bold text-sm">Smart Request Routing</h3>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-gov-blue-pale text-gov-blue rounded-full"><Shield size={24} /></div>
              <h3 className="font-bold text-sm">Priority Management</h3>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-gov-blue-pale text-gov-blue rounded-full"><Search size={24} /></div>
              <h3 className="font-bold text-sm">Transparent Tracking</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gov-navy mb-4">How Can We Help You Today?</h2>
          <p className="text-gov-text-sec max-w-2xl mx-auto">Select a category below to submit a new public service request.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(cat => (
            <Link 
              key={cat.id} 
              to={`/submit?category=${cat.id}`}
              className="bg-white p-6 rounded-xl border border-gov-border shadow-sm hover:shadow-md hover:border-gov-blue transition-all group flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-gov-bg rounded-full flex items-center justify-center mb-4 group-hover:bg-gov-blue group-hover:text-white transition-colors text-gov-navy">
                <FileText size={28} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gov-navy">{cat.name}</h3>
              <p className="text-sm text-gov-text-sec mb-4 flex-grow">{cat.description}</p>
              <span className="text-gov-blue text-sm font-medium group-hover:underline">Submit Request &rarr;</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-gov-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-white/20 -translate-y-1/2 z-0"></div>
            
            {[
              { step: 1, title: 'Submit Request', desc: 'Provide details and location' },
              { step: 2, title: 'Smart Routing', desc: 'Reaches the correct department' },
              { step: 3, title: 'Track Status', desc: 'Follow progress online' },
              { step: 4, title: 'Resolution', desc: 'Department fixes the issue' }
            ].map(item => (
              <div key={item.step} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gov-saffron rounded-full flex items-center justify-center text-xl font-bold shadow-lg mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Accessibility Promise */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-gov-border shadow-sm p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gov-navy mb-4">Designed for Every Citizen</h2>
              <p className="text-gov-text mb-6">
                CivicEase is built with accessibility as its core foundation, ensuring everyone can participate in civic maintenance.
              </p>
              <ul className="space-y-3">
                {['Keyboard-only navigation support', 'High contrast mode for visibility', 'Adjustable text sizing (A, A+, A++)', 'Accessible digital grievance redressal', 'Screen-reader compatible interfaces'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-gov-green shrink-0 mt-0.5" size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gov-bg p-8 rounded-xl flex items-center justify-center border border-gov-border">
              <div className="text-center">
                <Settings2 size={48} className="text-gov-blue mx-auto mb-4" />
                <p className="font-medium text-lg">Use the top menu to adjust accessibility settings at any time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
