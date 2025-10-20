// components/layouts/PublicLayout.tsx
import Header from '@/components/partials/Header';
import Footer from '@/components/partials/Footer';
import React from 'react';

type PublicLayoutProps = {
  children: React.ReactNode;
  banner: React.ReactNode; // Ini adalah "Region" (Slot) untuk banner
};

export default function PublicLayout({ children, banner }: PublicLayoutProps) {
  return (
    <div className="public-wrapper">
      <Header />
      {banner} {/* REGION "banner" ditempatkan di sini */}
      <main>{children}</main>
      <Footer />
    </div>
  );
}