// app/(dashboard)/layout.tsx
import { requireAdmin } from "@/utils/adminAuth"; // <-- Dari kode Anda
import DashboardLayout from '@/components/layouts/DashboardLayout'; // <-- Abstraksi baru
import React from 'react';

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Fungsi ini menangani semua otentikasi dan otorisasi sisi server
  await requireAdmin();

  // 2. Setelah lolos, render children di dalam komponen DashboardLayout
  return <DashboardLayout>{children}</DashboardLayout>;
}