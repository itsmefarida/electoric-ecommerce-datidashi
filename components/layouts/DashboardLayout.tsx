// components/layouts/DashboardLayout.tsx
import DashboardSidebar from '@/components/partials/DashboardSidebar';
import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <DashboardSidebar />
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}