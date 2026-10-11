import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { SubmitRequest } from './pages/SubmitRequest';
import { TrackRequest } from './pages/TrackRequest';
import { Login } from './pages/Login';
import { StaffDashboard } from './pages/StaffDashboard';
import { ReviewDashboard } from './pages/ReviewDashboard';

function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="submit" element={<SubmitRequest />} />
              <Route path="track" element={<TrackRequest />} />
              <Route path="dashboard" element={<ReviewDashboard />} />
              <Route path="tracker" element={<ReviewDashboard />} />
              <Route path="reviews" element={<ReviewDashboard />} />
              <Route path="login" element={<Login />} />
              <Route path="staff" element={<StaffDashboard />} />
              {/* Fallback for other pages */}
              <Route path="services" element={<Home />} />
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </AccessibilityProvider>
  );
}

export default App;
