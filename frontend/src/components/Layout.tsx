import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-animated-orbs relative overflow-x-hidden">
      <Header />
      <main id="main-content" className="flex-grow z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
