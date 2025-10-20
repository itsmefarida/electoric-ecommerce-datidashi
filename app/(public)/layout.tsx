// app/(public)/layout.tsx
import PublicLayout from '@/components/layouts/PublicLayout';
import React from 'react';

export default function Layout({
  children,
  banner, // <-- Prop ini otomatis diisi oleh Next.js dari folder @banner
}: {
  children: React.ReactNode;
  banner: React.ReactNode;
}) {
  // Teruskan prop ke komponen layout abstrak kita
  return (
    <PublicLayout banner={banner}>
      {children}
    </PublicLayout>
  );
}